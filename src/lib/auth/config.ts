// src/lib/auth/config.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { client } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

interface Credentials {
    email?: string;
    password?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials?: Credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    // User in Sanity finden
                    const user = await client.fetch(
                        `*[_type == "user" && email == $email && aktiv == true][0]`,
                        { email: credentials.email }
                    )

                    if (!user || !user.password) {
                        return null
                    }

                    // Passwort überprüfen
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isValid) {
                        return null
                    }

                    // Login-Zeitpunkt aktualisieren
                    await client
                        .patch(user._id)
                        .set({ lastLogin: new Date().toISOString() })
                        .commit()

                    // Erforderliche User-Daten zurückgeben
                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        aktiv: user.aktiv,
                        image: user.avatar?.asset?.url
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 Tage
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.aktiv = user.aktiv
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.aktiv = token.aktiv as boolean
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    }
}