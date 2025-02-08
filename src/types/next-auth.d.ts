// types/next-auth.d.ts
import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface User {
        id: string
        email: string
        name: string
        role: 'admin' | 'billing' | 'user'
        aktiv: boolean
        avatar?: {
            _type: 'image'
            asset: {
                _ref: string
                _type: 'reference'
            }
        }
        createdAt: string
        updatedAt: string
        sessionMaxAge?: number
    }

    interface Session {
        user: User & {
            id: string
            role: 'admin' | 'billing' | 'user'
            aktiv: boolean
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
        maxAge?: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'admin' | 'billing' | 'user'
        aktiv: boolean
        avatar?: {
            _type: 'image'
            asset: {
                _ref: string
                _type: 'reference'
            }
        }
        createdAt: string
        updatedAt: string
        sessionMaxAge?: number
    }
}