// lib/auth/config.ts
import { AuthOptions, CallbacksOptions, Session, User, Account, Profile } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { client, writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/security/activityLogger'
import { JWT } from 'next-auth/jwt'

type UserRole = 'admin' | 'billing' | 'user'

interface SanityUser {
    _id: string
    email: string
    name: string
    role: UserRole
    aktiv: boolean
    password: string
    avatar?: {
        _type: 'image'
        asset: {
            _ref: string
            _type: 'reference'
        }
    }
    twoFactorEnabled?: boolean
    twoFactorSecret?: string
    recoveryCodes?: string[]
    createdAt: string
    updatedAt: string
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                twoFactorVerified: { label: "2FA Verified", type: "text" },
                recoveryCode: { label: "Recovery Code", type: "text" },
                rememberDevice: { label: "Remember Device", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null

                const user = await client.fetch<SanityUser>(
                    `*[_type == "user" && email == $email][0]{
                        _id,
                        email,
                        password,
                        name,
                        role,
                        aktiv,
                        avatar,
                        twoFactorEnabled,
                        twoFactorSecret,
                        recoveryCodes,
                        createdAt,
                        updatedAt
                    }`,
                    { email: credentials.email }
                )

                if (!user || !user.aktiv) {
                    await logActivity({
                        userId: user?._id || 'unknown',
                        activityType: 'login_failed',
                        details: 'Ungültige Anmeldedaten oder inaktiver Benutzer'
                    }).catch(console.error)
                    throw new Error('Ungültige Anmeldedaten')
                }

                const sessionMaxAge = credentials.rememberDevice === 'true'
                    ? 30 * 24 * 60 * 60  // 30 Tage
                    : 24 * 60 * 60       // 24 Stunden

                // Prüfe zuerst auf Recovery Code
                if (credentials.recoveryCode && user.twoFactorEnabled) {
                    const recoveryCode = credentials.recoveryCode.toUpperCase()
                    if (!user.recoveryCodes?.includes(recoveryCode)) {
                        await logActivity({
                            userId: user._id,
                            activityType: 'login_failed',
                            details: 'Ungültiger Recovery Code'
                        }).catch(console.error)
                        throw new Error('Ungültiger Recovery Code')
                    }

                    await writeClient
                        .patch(user._id)
                        .set({
                            recoveryCodes: user.recoveryCodes.filter(code => code !== recoveryCode),
                            updatedAt: new Date().toISOString()
                        })
                        .commit()

                    await logActivity({
                        userId: user._id,
                        activityType: 'login',
                        details: 'Login mit Recovery Code'
                    }).catch(console.error)

                    return {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        aktiv: user.aktiv,
                        avatar: user.avatar,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        sessionMaxAge
                    }
                }

                // Dann prüfe auf 2FA
                if (credentials.twoFactorVerified === 'true') {
                    await logActivity({
                        userId: user._id,
                        activityType: 'login',
                        details: 'Login mit 2FA'
                    }).catch(console.error)

                    return {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        aktiv: user.aktiv,
                        avatar: user.avatar,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        sessionMaxAge
                    }
                }

                // Normaler Login-Versuch
                if (!credentials.password) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) {
                    await logActivity({
                        userId: user._id,
                        activityType: 'login_failed',
                        details: 'Falsches Passwort'
                    }).catch(console.error)
                    throw new Error('Ungültige Anmeldedaten')
                }

                if (user.twoFactorEnabled) {
                    throw new Error('2FA_REQUIRED')
                }

                await logActivity({
                    userId: user._id,
                    activityType: 'login',
                    details: 'Erfolgreicher Login'
                }).catch(console.error)

                return {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    aktiv: user.aktiv,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    sessionMaxAge
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                    aktiv: user.aktiv,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    sessionMaxAge: user.sessionMaxAge
                }
            }
            return token
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as UserRole
                session.user.aktiv = token.aktiv as boolean
                session.user.avatar = token.avatar
                session.user.createdAt = token.createdAt as string
                session.user.updatedAt = token.updatedAt as string
                session.maxAge = token.sessionMaxAge as number
            }
            return session
        }
    },
    events: {
        async signOut({ token }: { token: JWT }) {
            if (token?.id) {
                await logActivity({
                    userId: token.id,
                    activityType: 'logout',
                    details: 'Erfolgreich ausgeloggt'
                }).catch(console.error)
            }
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,  // Standard: 24 Stunden
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    }
}