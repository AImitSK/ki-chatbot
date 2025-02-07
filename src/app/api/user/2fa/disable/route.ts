// app/api/user/2fa/disable/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'

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
        const userId = await client.fetch(
            `*[_type == "user" && email == $email][0]._id`,
            { email: session.user.email }
        )

        if (!userId) {
            return NextResponse.json(
                { message: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        // 2FA Deaktivieren
        await writeClient
            .patch(userId)
            .unset(['twoFactorSecret'])
            .set({
                twoFactorEnabled: false,
                updatedAt: new Date().toISOString()
            })
            .commit()

        // Aktualisierte Benutzerdaten abrufen
        const updatedUser = await client.fetch(
            `*[_type == "user" && _id == $userId][0]{
                _id,
                email,
                name,
                role,
                aktiv,
                avatar,
                twoFactorEnabled,
                createdAt,
                updatedAt
            }`,
            { userId }
        )

        return NextResponse.json({
            success: true,
            message: '2FA wurde erfolgreich deaktiviert',
            user: updatedUser
        })

    } catch (error) {
        console.error('2FA Deaktivierung Fehler:', error)
        return NextResponse.json(
            { message: 'Deaktivierung fehlgeschlagen' },
            { status: 500 }
        )
    }
}