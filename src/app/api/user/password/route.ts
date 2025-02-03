// app/api/user/password/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const { currentPassword, newPassword } = await request.json()

        // Benutzer aus Sanity holen
        const user = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: session.user.id }
        )

        // Aktuelles Passwort überprüfen
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            return NextResponse.json(
                { message: 'Aktuelles Passwort ist nicht korrekt' },
                { status: 400 }
            )
        }

        // Neues Passwort hashen und speichern
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await client
            .patch(session.user.id)
            .set({
                password: hashedPassword,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json(
            { message: 'Passwort erfolgreich geändert' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Fehler bei Passwortänderung:', error)
        return NextResponse.json(
            { message: 'Fehler bei der Passwortänderung' },
            { status: 500 }
        )
    }
}