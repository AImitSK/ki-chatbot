// src/types/index.ts
export * from './sanity'

export interface User {
    _id: string
    name: string
    email: string
    telefon?: string
    position?: string
    avatar?: {
        _type: 'image'
        asset: {
            _ref: string
            _type: 'reference'
        }
        alt?: string
    }
    role: 'admin' | 'billing' | 'user'
    aktiv: boolean
    createdAt: string
    updatedAt: string
    lastLogin?: string
    password?: string
    emailVerified?: string
    accounts?: any[]
    sessions?: any[]
    notizen?: string
}