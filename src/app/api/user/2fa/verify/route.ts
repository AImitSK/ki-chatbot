// app/api/user/2fa/verify/route.ts
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

        const { token } = await request.json()

        // Hole das temporäre Secret
        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                tempTwoFactorSecret,
                twoFactorSetupPending
            }`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json(
                { message: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        if (!user.tempTwoFactorSecret || !user.twoFactorSetupPending) {
            return NextResponse.json(
                { message: '2FA Setup nicht initialisiert' },
                { status: 400 }
            )
        }

        // Verifiziere den Token
        const isValid = authenticator.verify({
            token,
            secret: user.tempTwoFactorSecret
        })

        if (!isValid) {
            return NextResponse.json(
                { message: 'Ungültiger Code' },
                { status: 400 }
            )
        }

        // Aktiviere 2FA für den Benutzer
        await writeClient
            .patch(user._id)
            .set({
                twoFactorEnabled: true,
                twoFactorSecret: user.tempTwoFactorSecret,
                twoFactorSetupPending: false
            })
            .unset(['tempTwoFactorSecret'])
            .commit()

        return NextResponse.json({
            message: '2FA erfolgreich aktiviert'
        })

    } catch (error) {
        console.error('2FA Verifikation Fehler:', error)
        return NextResponse.json(
            { message: 'Fehler bei der 2FA Verifikation' },
            { status: 500 }
        )
    }
}
