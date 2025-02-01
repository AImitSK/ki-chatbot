// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from 'next-auth'
import { SanityClient } from "next-sanity"

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: string
            aktiv: boolean
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        id: string
        role: string
        aktiv: boolean
    }
}

declare module 'next-auth/adapters' {
    interface AdapterUser {
        id: string
        role: string
        aktiv: boolean
        email: string
        emailVerified: Date | null
        name?: string | null
        image?: string | null
    }
}

// Erweiterte Client-Type für Sanity
declare module '@sanity/client' {
    interface SanityClient {
        config: () => {
            projectId: string
            dataset: string
            apiVersion: string
            useCdn: boolean
        }
    }
}