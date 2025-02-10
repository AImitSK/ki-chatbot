// src/types/index.ts
export * from './sanity'

export interface User {
    id: string;
    email: string;
    name: string;
    telefon?: string;  // Optional, da nicht jeder Benutzer eine Telefonnummer hat
    position?: string; // Optional, da nicht jeder Benutzer eine Position hat
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
    lastLogin?: string;
    password?: string;
    emailVerified?: string;
    accounts?: any[];
    sessions?: any[];
    notizen?: string;
}

export type UserRole = 'admin' | 'billing' | 'user'

export interface User {
    _id: string
    name: string
    email: string
    telefon?: string
    position?: string
    role: UserRole
    aktiv: boolean
    avatar?: {
        asset: {
            _ref: string
            url?: string
        }
    }
    createdAt: string
    updatedAt: string
}
