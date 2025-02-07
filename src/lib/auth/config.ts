import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { client } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

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
                twoFactorVerified: { label: "2FA Verified", type: "text" }
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
                        createdAt,
                        updatedAt
                    }`,
                    { email: credentials.email }
                )

                if (!user || !user.aktiv) {
                    throw new Error('Ungültige Anmeldedaten')
                }

                if (credentials.twoFactorVerified === 'true') {
                    return {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        aktiv: user.aktiv,
                        avatar: user.avatar,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }

                if (!credentials.password) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) {
                    throw new Error('Ungültige Anmeldedaten')
                }

                if (user.twoFactorEnabled) {
                    throw new Error('2FA_REQUIRED')
                }

                return {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    aktiv: user.aktiv,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                // Token mit aktualisierten Session-Daten aktualisieren
                return { ...token, ...session.user }
            }
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role as UserRole,
                    aktiv: user.aktiv,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    id: token.id,
                    role: token.role as UserRole,
                    aktiv: token.aktiv,
                    avatar: token.avatar,
                    createdAt: token.createdAt,
                    updatedAt: token.updatedAt
                }
            }
            return session
        }
    },
    events: {
        async updateUser(message) {
            console.log('User updated:', message)
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Tage
        updateAge: 24 * 60 * 60     // 24 Stunden
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    }
}