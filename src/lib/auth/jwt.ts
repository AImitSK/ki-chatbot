// lib/auth/jwt.ts
import jwt from 'jsonwebtoken'

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET must be defined')
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET

interface TokenPayload {
    userId: string
    email: string
    exp?: number
}

export async function signJwtToken(payload: TokenPayload): Promise<string> {
    // Token läuft nach 15 Minuten ab
    const token = jwt.sign(
        {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (15 * 60)
        },
        JWT_SECRET
    )
    return token
}

export async function verifyJwtToken(token: string): Promise<TokenPayload> {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
        return payload
    } catch (error) {
        throw new Error('Invalid token')
    }
}