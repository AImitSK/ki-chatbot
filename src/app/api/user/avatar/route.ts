// app/api/user/avatar/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('avatar') as File

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei übermittelt' }, { status: 400 })
        }

        // Datei zu Sanity hochladen
        const buffer = await file.arrayBuffer()
        const asset = await client.assets.upload('image', Buffer.from(buffer), {
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
                    alt: session.user.name
                }
            })
            .commit()

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Avatar-Upload:', error)
        return NextResponse.json(
            { error: 'Fehler beim Upload' },
            { status: 500 }
        )
    }
}