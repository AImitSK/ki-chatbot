// src/app/api/company/billing-recipient/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { name, email, telefon, position, companyId } = await req.json()

        // Prüfe ob User bereits existiert
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]._id`,
            { email }
        )

        if (existingUser) {
            return new NextResponse('Email bereits registriert', { status: 400 })
        }

        // Erstelle temporäres Passwort
        const tempPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(tempPassword, 12)

        // Erstelle den neuen User
        const newUser = await writeClient.create({
            _type: 'user',
            name,
            email,
            telefon,
            position,
            role: 'billing',
            password: hashedPassword,
            aktiv: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })

        // TODO: Sende Email mit Zugangsdaten

        return NextResponse.json({
            user: newUser,
            tempPassword // In Produktion würden wir das nur per Email versenden
        })
    } catch (error) {
        console.error('Error creating billing recipient:', error)
        return new NextResponse(
            'Fehler beim Erstellen des Rechnungsempfängers',
            { status: 500 }
        )
    }
}