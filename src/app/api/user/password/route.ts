// app/api/user/password/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client, writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const { currentPassword, newPassword } = await request.json()

        // Benutzer aus Sanity holen
        const user = await client.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                password
            }`,
            { email: session.user.email }
        )

        if (!user) {
            console.error('Benutzer nicht gefunden für Email:', session.user.email)
            return NextResponse.json(
                { message: 'Benutzer nicht gefunden' },
                { status: 404 }
            )
        }

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
        await writeClient
            .patch(user._id)
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