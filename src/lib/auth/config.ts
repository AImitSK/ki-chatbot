import { AuthOptions, Session } from 'next-auth'
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
    createdAt: string
    updatedAt: string
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
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

                // 🔥 **Fix für Passwortüberprüfung**
                let isValid = await bcrypt.compare(credentials.password, user.password)

                // Falls Passwort noch im Klartext gespeichert ist, jetzt korrigieren!
                if (!isValid && !user.password.startsWith('$2a$')) {
                    console.log('⚠️ Passwort ist nicht gehasht. Es wird jetzt korrigiert.');

                    // Temporäre Speicherung des alten Klartextpassworts
                    const oldPassword = user.password;

                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    await writeClient.patch(user._id).set({ password: hashedPassword }).commit();

                    console.log('🔒 Passwort wurde sicher gehasht und gespeichert.');

                    // **Jetzt das frisch gehashte Passwort erneut vergleichen!**
                    isValid = await bcrypt.compare(oldPassword, hashedPassword);
                    if (!isValid) {
                        console.error('❌ Fehler beim Passwort-Vergleich nach Hashing!');
                        throw new Error('Ungültige Anmeldedaten.');
                    }
                }

                if (!isValid) {
                    console.log('❌ Falsches Passwort für:', credentials.email);

                    await logActivity({
                        userId: user._id,
                        activityType: 'login_failed',
                        details: 'Falsches Passwort'
                    }).catch(console.error);

                    throw new Error('Ungültige Anmeldedaten');
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
                    updatedAt: user.updatedAt
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
                    updatedAt: user.updatedAt
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
