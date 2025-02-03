// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

// GET-Handler hinzufügen
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const user = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: session.user.id }
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

// Bestehende POST-Methode beibehalten
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const data = await request.json()

        const updatedUser = await client
            .patch(session.user.id)
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