// src/types/index.ts
export * from './sanity'

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'billing' | 'user';
    aktiv: boolean;
    twoFactorEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
    avatar?: {
        _type: 'image'
        asset: {
            _ref: string
            _type: 'reference'
        }
        alt?: string
    }
    lastLogin?: string
    password?: string
    emailVerified?: string
    accounts?: any[]
    sessions?: any[]
    notizen?: string
}

