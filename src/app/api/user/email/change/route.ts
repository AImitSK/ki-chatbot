// app/api/user/email/change/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeClient } from '@/lib/sanity/client'
import { authOptions } from '@/lib/auth/config'
import { sendChangeEmailVerification } from '@/lib/email/sendgrid'
import { randomBytes } from 'crypto'

function generateToken(): string {
    return randomBytes(32).toString('hex')
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const { newEmail } = await request.json()
        const userId = session.user.id
        const token = generateToken()

        const mutation = {
            createOrReplace: {
                _type: 'emailVerification',
                _id: `emailVerification-${Date.now()}`,
                token,
                userId,
                newEmail,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            }
        }

        await writeClient.mutate([mutation])
        await sendChangeEmailVerification(newEmail, token, session.user.name || '')

        return NextResponse.json({ message: 'Email-Verifizierung gesendet' })
    } catch (error) {
        console.error('Fehler bei Email-Änderung:', error)
        return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
    }
}