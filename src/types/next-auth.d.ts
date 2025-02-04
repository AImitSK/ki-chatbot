// types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface User {
        id: string
        name: string
        email: string
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
    }
}