// app/api/user/avatar/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        // Benutzer finden
        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]._id`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
        }

        const formData = await request.formData()
        const file = formData.get('avatar') as File

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei übermittelt' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const asset = await writeClient.assets.upload('image', Buffer.from(buffer), {
            filename: file.name,
            contentType: file.type
        })

        const updatedUser = await writeClient
            .patch(user)
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

        // Hole die kompletten aktualisierten Benutzerdaten
        const fullUser = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: user }
        )

        return NextResponse.json(fullUser)
    } catch (error) {
        console.error('Fehler beim Avatar-Upload:', error)
        return NextResponse.json(
            { error: 'Fehler beim Upload' },
            { status: 500 }
        )
    }
}