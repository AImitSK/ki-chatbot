// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

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

        // Wir geben das aktualisierte User-Objekt zurück
        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils:', error)
        return NextResponse.json(
            { error: 'Fehler beim Aktualisieren des Profils' },
            { status: 500 }
        )
    }
}