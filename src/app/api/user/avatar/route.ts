// app/api/user/avatar/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

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

        // Datei aus FormData extrahieren
        const formData = await request.formData()
        const file = formData.get('avatar') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'Keine Datei übermittelt' },
                { status: 400 }
            )
        }

        // Dateiformat prüfen
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Nur Bilddateien sind erlaubt' },
                { status: 400 }
            )
        }

        // Datei zu Sanity hochladen
        const fileBuffer = await file.arrayBuffer()
        const asset = await client.assets.upload('image', Buffer.from(fileBuffer), {
            filename: file.name,
            contentType: file.type
        })

        // User-Dokument aktualisieren
        const updatedUser = await client
            .patch(session.user.id)
            .set({
                avatar: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    },
                    alt: session.user.name || 'User Avatar'
                },
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Avatar-Upload:', error)
        return NextResponse.json(
            { error: 'Fehler beim Hochladen des Avatars' },
            { status: 500 }
        )
    }
}

// DELETE-Route zum Entfernen des Avatars
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // Avatar-Referenz entfernen
        const updatedUser = await client
            .patch(session.user.id)
            .unset(['avatar'])
            .set({ updatedAt: new Date().toISOString() })
            .commit()

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Entfernen des Avatars:', error)
        return NextResponse.json(
            { error: 'Fehler beim Entfernen des Avatars' },
            { status: 500 }
        )
    }
}