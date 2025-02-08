// app/api/user/2fa/recovery-codes/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Nicht authentifiziert' },
                { status: 401 }
            )
        }

        const user = await client.fetch(
            `*[_type == "user" && _id == $userId][0]{
                recoveryCodes,
                twoFactorEnabled
            }`,
            { userId: session.user.id }
        )

        if (!user?.twoFactorEnabled) {
            return NextResponse.json(
                { error: '2FA ist nicht aktiviert' },
                { status: 400 }
            )
        }

        return NextResponse.json({ recoveryCodes: user.recoveryCodes || [] })

    } catch (error) {
        console.error('Fehler beim Abrufen der Recovery Codes:', error)
        return NextResponse.json(
            { error: 'Fehler beim Abrufen der Recovery Codes' },
            { status: 500 }
        )
    }
}