// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import { User } from '@/types'

export async function POST(request: Request) {
    try {
        // Session prüfen
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // Daten vom Request holen
        const data = await request.json()

        // Nur erlaubte Felder aktualisieren
        const allowedFields = {
            name: data.name,
            telefon: data.telefon,
            position: data.position,
            updatedAt: new Date().toISOString()
        }

        // Update in Sanity durchführen
        const updatedUser = await client
            .patch(session.user.id)
            .set(allowedFields)
            .commit()

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils:', error)
        return NextResponse.json(
            { error: 'Interner Server-Fehler' },
            { status: 500 }
        )
    }
}

// GET-Route zum Abrufen der Benutzerdaten
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const user = await client.fetch<User>(
            `*[_type == "user" && _id == $userId][0]`,
            { userId: session.user.id }
        )

        if (!user) {
            return NextResponse.json(
                { error: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)

    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error)
        return NextResponse.json(
            { error: 'Interner Server-Fehler' },
            { status: 500 }
        )
    }
}