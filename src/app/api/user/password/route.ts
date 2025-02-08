// src/app/api/user/password/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/security/activityLogger'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { currentPassword, newPassword } = await req.json()

        // Hole aktuellen Benutzer
        const user = await writeClient.fetch(
            `*[_type == "user" && _id == $userId][0]{
                _id,
                password
            }`,
            { userId: session.user.id }
        )

        // Überprüfe aktuelles Passwort
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) {
            // Fehlgeschlagener Versuch loggen
            await logActivity({
                userId: session.user.id,
                activityType: 'password_change_failed',
                details: 'Aktuelles Passwort falsch'
            })
            return new NextResponse('Aktuelles Passwort ist falsch', { status: 400 })
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

        // Erfolgreiche Änderung loggen
        await logActivity({
            userId: session.user.id,
            activityType: 'password_change',
            details: 'Passwort erfolgreich geändert'
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error changing password:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}