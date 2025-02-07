// app/api/user/email/verify/route.ts
import { NextResponse } from 'next/server'
import { client, writeClient } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: Request) {
    try {
        const { token } = await request.json()
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            console.log('Keine Session gefunden')
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
                userId: user
            }
        )

        if (!verification) {
            return NextResponse.json(
                { message: 'Ungültiger oder abgelaufener Token' },
                { status: 400 }
            )
        }

        // Email des Benutzers aktualisieren und Token als verwendet markieren
        await writeClient
            .transaction()
            .patch(user, {
                set: {
                    email: verification.newEmail,
                    updatedAt: new Date().toISOString()
                }
            })
            .patch(verification._id, {
                set: {
                    usedAt: new Date().toISOString()
                }
            })
            .commit()

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