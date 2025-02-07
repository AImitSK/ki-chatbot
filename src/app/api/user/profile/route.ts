// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'

// GET-Handler
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json(
                { error: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)

    } catch (error) {
        console.error('Fehler beim Abrufen des Profils:', error)
        return NextResponse.json(
            { error: 'Fehler beim Abrufen des Profils' },
            { status: 500 }
        )
    }
}

// POST-Methode
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // Erst den Benutzer finden
        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]._id`,
            { email: session.user.email }
        )

        if (!user) {
            console.error('Benutzer nicht gefunden für Email:', session.user.email)
            return NextResponse.json(
                { error: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

        const data = await request.json()
        console.log('Update-Daten:', data)
        console.log('User ID:', user)

        // Dann mit der korrekten ID updaten
        const updatedUser = await writeClient
            .patch(user)
            .set({
                name: data.name,
                telefon: data.telefon,
                position: data.position,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils:', error)
        return NextResponse.json(
            { error: 'Fehler beim Aktualisieren des Profils' },
            { status: 500 }
        )
    }
}