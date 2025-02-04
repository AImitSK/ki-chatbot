// lib/auth/tokens.ts
import { randomBytes } from 'crypto'
import { client } from '@/lib/sanity/client'
import type { SanityClient } from '@sanity/client'

export async function generateVerificationToken(userId: string, newEmail: string): Promise<string> {
    // Token generieren
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 Stunden

    console.log('Generiere Token:', {
        token,
        userId,
        newEmail,
        expiresAt
    })

    // Token in Sanity speichern mit Logging
    try {
        const result = await client.create({
            _type: 'emailVerification',
            token,
            userId,
            newEmail,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        })
        console.log('Token gespeichert:', result)
        return token
    } catch (error) {
        console.error('Fehler beim Speichern des Tokens:', error)
        throw error
    }
}