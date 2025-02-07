// app/api/user/2fa/setup/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // Benutzer finden
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

        // Generiere ein geheimes Token für den Benutzer
        const secret = authenticator.generateSecret()

        // Generiere den otpauth URL für QR-Code
        const otpauthUrl = authenticator.keyuri(
            session.user.email!,
            'SK Online Marketing',
            secret
        )

        // Speichere das Secret temporär (unbestätigt)
        await writeClient
            .patch(user)
            .set({
                tempTwoFactorSecret: secret,
                twoFactorSetupPending: true
            })
            .commit()

        return NextResponse.json({
            secret,
            otpauthUrl
        })

    } catch (error) {
        console.error('2FA Setup Fehler:', error)
        return NextResponse.json(
            { message: 'Fehler beim 2FA Setup' },
            { status: 500 }
        )
    }
}