// lib/auth/tokens.ts
import crypto from 'crypto'
import { client } from '@/lib/sanity/client'

export async function generateVerificationToken(userId: string, newEmail: string): Promise<string> {
    // Zufälligen Token generieren
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 Stunden

    // Token in Sanity speichern
    await client.create({
        _type: 'emailVerification',
        token,
        userId,
        newEmail,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
    })

    return token
}