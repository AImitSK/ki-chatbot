// app/api/user/email/change/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'
import { sendChangeEmailVerification } from '@/lib/email/sendgrid'
import { generateVerificationToken } from '@/lib/auth/tokens'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const { newEmail, password } = await request.json()

        // Benutzer aus Sanity holen
        const user = await client.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: session.user.id }
        )

        // Passwort überprüfen
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { message: 'Passwort ist nicht korrekt' },
                { status: 400 }
            )
        }

        // Prüfen ob die Email bereits existiert
        const emailExists = await client.fetch(
            `*[_type == "user" && email == $email && _id != $id][0]`,
            { email: newEmail, id: session.user.id }
        )

        if (emailExists) {
            return NextResponse.json(
                { message: 'Diese E-Mail-Adresse wird bereits verwendet' },
                { status: 400 }
            )
        }

        // Verifikationstoken generieren
        const token = await generateVerificationToken(session.user.id, newEmail)

        // Bestätigungs-Email senden
        await sendChangeEmailVerification(newEmail, token, session.user.name ?? '')

        return NextResponse.json(
            { message: 'Bestätigungs-Email wurde gesendet' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Fehler bei Email-Änderung:', error)
        return NextResponse.json(
            { message: 'Fehler bei der Email-Änderung' },
            { status: 500 }
        )
    }
}