// app/api/user/email/verify/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: Request) {
    try {
        const { token } = await request.json()
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            console.log('Keine Session gefunden')
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // Debug-Logging
        console.log('Suche Token:', token)
        console.log('User ID:', session.user.id)

        // Lassen Sie uns zuerst alle Token für diesen Benutzer finden
        const allTokens = await client.fetch(
            `*[_type == "emailVerification" && userId == $userId]`,
            { userId: session.user.id }
        )
        console.log('Gefundene Tokens:', allTokens)

        // Original-Query mit mehr Details
        const verification = await client.fetch(
            `*[_type == "emailVerification" && token == $token && userId == $userId][0]{
                _id,
                token,
                userId,
                newEmail,
                expiresAt,
                usedAt
            }`,
            {
                token,
                userId: session.user.id
            }
        )
        console.log('Gefundene Verifikation:', verification)

        if (!verification) {
            return NextResponse.json(
                { message: 'Ungültiger oder abgelaufener Token' },
                { status: 400 }
            )
        }

        // Transaktion für die Aktualisierungen
        const transaction = client.transaction()

        // Email des Benutzers aktualisieren
        transaction.patch(session.user.id, {
            set: {
                email: verification.newEmail,
                updatedAt: new Date().toISOString()
            }
        })

        // Token als verwendet markieren
        transaction.patch(verification._id, {
            set: {
                usedAt: new Date().toISOString()
            }
        })

        // Transaktion ausführen
        await transaction.commit()

        return NextResponse.json(
            { message: 'Email-Adresse erfolgreich geändert' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Detaillierter Fehler:', error)
        return NextResponse.json(
            { message: 'Fehler bei der Email-Verifizierung' },
            { status: 500 }
        )
    }
}