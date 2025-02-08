// app/api/user/2fa/recovery-codes/generate/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'
import { randomBytes } from 'crypto'

function generateRecoveryCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () =>
        randomBytes(4).toString('hex').toUpperCase()
    )
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]._id`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json(
                { message: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        const recoveryCodes = generateRecoveryCodes()

        await writeClient
            .patch(user)
            .set({
                recoveryCodes,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json({ recoveryCodes })

    } catch (error) {
        console.error('Fehler beim Generieren der Recovery Codes:', error)
        return NextResponse.json(
            { message: 'Fehler beim Generieren der Recovery Codes' },
            { status: 500 }
        )
    }
}