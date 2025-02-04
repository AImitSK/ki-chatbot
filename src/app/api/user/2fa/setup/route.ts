// app/api/user/2fa/setup/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
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
        await client
            .patch(session.user.id)
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