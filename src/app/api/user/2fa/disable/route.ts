// app/api/user/2fa/disable/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        // 2FA Deaktivieren
        await client
            .patch(session.user.id)
            .unset(['twoFactorSecret'])
            .set({
                twoFactorEnabled: false,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json({
            success: true,
            message: '2FA wurde erfolgreich deaktiviert'
        })

    } catch (error) {
        console.error('2FA Deaktivierung Fehler:', error)
        return NextResponse.json(
            { message: 'Deaktivierung fehlgeschlagen' },
            { status: 500 }
        )
    }
}