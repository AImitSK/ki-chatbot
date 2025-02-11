// app/api/company/billing-recipient/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeClient } from '@/lib/sanity/client'
import { sendBillingInvitation } from '@/lib/email/sendgrid'
import { randomBytes } from 'crypto'

function generateToken(): string {
    return randomBytes(32).toString('hex')
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { name, email, telefon, position, companyId } = await req.json()
        console.log('Empfangene Daten:', { name, email, telefon, position, companyId })

        // Prüfe ob der Benutzer bereits existiert
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        )

        if (existingUser) {
            return NextResponse.json({
                message: 'Dieser Benutzer hat bereits ein Konto.'
            }, { status: 400 })
        }

        // Hole das Unternehmen
        const company = await writeClient.fetch(
            `*[_type == "unternehmen" && _id == $companyId][0]`,
            { companyId }
        )

        if (!company) {
            return NextResponse.json({
                message: 'Unternehmen nicht gefunden'
            }, { status: 400 })
        }

        // Prüfe auf existierende, nicht verwendete Einladung
        const existingInvite = await writeClient.fetch(
            `*[_type == "billingInvite" && email == $email && !defined(usedAt)][0]`,
            { email }
        )

        let invite
        if (existingInvite) {
            // Update existierende Einladung
            invite = await writeClient
                .patch(existingInvite._id)
                .set({
                    name,
                    telefon,
                    position,
                    token: generateToken(),
                    tempPassword: Math.random().toString(36).slice(-8),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .commit()
        } else {
            // Erstelle neue Einladung
            invite = await writeClient.create({
                _type: 'billingInvite',
                email,
                name,
                telefon,
                position,
                companyId,
                token: generateToken(),
                tempPassword: Math.random().toString(36).slice(-8),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            })
        }

        // Sende die Einladung
        await sendBillingInvitation(
            email,
            name,
            company.name,
            invite.token,
            invite.tempPassword
        )

        return NextResponse.json({
            message: 'Einladung wurde gesendet',
            success: true
        })

    } catch (error) {
        console.error('Fehler:', error)
        return NextResponse.json({
            message: 'Fehler beim Erstellen des Rechnungsempfängers'
        }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        if (!data.userId) {
            return NextResponse.json({ message: 'User ID ist erforderlich' }, { status: 400 })
        }

        // Update User
        const updatedUser = await writeClient
            .patch(data.userId)
            .set({
                name: data.name,
                email: data.email,
                telefon: data.telefon,
                position: data.position,
                updatedAt: new Date().toISOString()
            })
            .commit()

        return NextResponse.json({ user: updatedUser })
    } catch (error) {
        console.error('Fehler:', error)
        return NextResponse.json({
            message: 'Fehler beim Aktualisieren des Rechnungsempfängers'
        }, { status: 500 })
    }
}