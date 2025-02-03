// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

export async function GET(request: Request) {
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

        return NextResponse.json(user)
    } catch (error) {
        console.error('Fehler beim Abrufen des Profils:', error)
        return NextResponse.json(
            { error: 'Fehler beim Abrufen des Profils' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    // Bestehende POST-Logik hier lassen
}