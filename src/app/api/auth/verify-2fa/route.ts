// app/api/auth/verify-2fa/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json(
                { message: 'Email und Code sind erforderlich' },
                { status: 400 }
            )
        }

        // Benutzer und 2FA-Secret aus Sanity holen
        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                email,
                twoFactorSecret,
                twoFactorEnabled
            }`,
            { email }
        )

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return NextResponse.json(
                { message: 'Ungültige Anfrage' },
                { status: 400 }
            )
        }

        // Code verifizieren
        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret
        })

        if (!isValid) {
            return NextResponse.json(
                { message: 'Ungültiger Code' },
                { status: 400 }
            )
        }

        // Ein temporäres Token erstellen, das die erfolgreiche 2FA-Verifizierung bestätigt
        return NextResponse.json({
            success: true,
            verified: true,
            email: user.email
        })

    } catch (error) {
        console.error('2FA Verifikation Fehler:', error)
        return NextResponse.json(
            { message: 'Verifikation fehlgeschlagen' },
            { status: 500 }
        )
    }
}