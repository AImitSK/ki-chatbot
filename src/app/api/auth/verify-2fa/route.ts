// app/api/auth/verify-2fa/route.ts
import { NextResponse } from 'next/server'
import { client, writeClient } from '@/lib/sanity/client'
import { authenticator } from 'otplib'

interface User {
    _id: string
    email: string
    twoFactorSecret: string | null
    twoFactorEnabled: boolean
    recoveryCodes?: string[]
}

export async function POST(request: Request) {
    try {
        const { email, code, rememberDevice } = await request.json()

        if (!email || !code) {
            return NextResponse.json(
                { message: 'Email und Code sind erforderlich' },
                { status: 400 }
            )
        }

        const upperCode = code.toUpperCase()

        // Benutzer und 2FA-Secret aus Sanity holen
        const user = await client.fetch<User>(
            `*[_type == "user" && email == $email][0]{
                _id,
                email,
                twoFactorSecret,
                twoFactorEnabled,
                recoveryCodes
            }`,
            { email }
        )

        if (!user || !user.twoFactorEnabled) {
            return NextResponse.json(
                { message: 'Ungültige Anfrage' },
                { status: 400 }
            )
        }

        // Prüfen ob es ein Recovery Code ist
        if (user.recoveryCodes?.includes(upperCode)) {
            // Recovery Code entfernen nach Benutzung
            await writeClient
                .patch(user._id)
                .set({
                    recoveryCodes: user.recoveryCodes.filter((rc: string) => rc !== upperCode),
                    updatedAt: new Date().toISOString()
                })
                .commit()

            return NextResponse.json({
                success: true,
                verified: true,
                email: user.email
            })
        }

        // Falls kein Recovery Code, dann normaler 2FA Check
        if (!user.twoFactorSecret) {
            return NextResponse.json(
                { message: 'Ungültige Anfrage' },
                { status: 400 }
            )
        }

        // Code verifizieren
        const isValid = authenticator.verify({
            token: upperCode,
            secret: user.twoFactorSecret
        })

        if (!isValid) {
            return NextResponse.json(
                { message: 'Ungültiger Code' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            verified: true,
            email: user.email,
            rememberDevice: !!rememberDevice  // Füge rememberDevice hinzu
        })

    } catch (error) {
        console.error('2FA Verifikation Fehler:', error)
        return NextResponse.json(
            { message: 'Verifikation fehlgeschlagen' },
            { status: 500 }
        )
    }
}