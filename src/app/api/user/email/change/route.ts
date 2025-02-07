// app/api/user/email/change/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeClient, client } from '@/lib/sanity/client'
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

        // Prüfen, ob die neue Email bereits existiert
        const existingUser = await client.fetch(
            `*[_type == "user" && email == $email && _id != $userId][0]`,
            {
                email: newEmail,
                userId: session.user.id
            }
        )

        if (existingUser) {
            return NextResponse.json(
                { error: 'Diese E-Mail-Adresse wird bereits verwendet' },
                { status: 400 }
            )
        }

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