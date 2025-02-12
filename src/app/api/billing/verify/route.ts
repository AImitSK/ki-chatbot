// app/api/billing/verify/route.ts
import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'

interface UserReference {
    _ref: string;
    _type: 'reference';
    _key?: string;
}

interface Project {
    _id: string;
    users?: UserReference[];
}

export async function POST(req: Request) {
    try {
        const { token } = await req.json()
        console.log('--- [DEBUG] Verifizierung gestartet ---')

        // 1. Hole die Einladung
        const invite = await writeClient.fetch(`
            *[_type == "billingInvite" && 
              token == $token && 
              !defined(usedAt) &&
              dateTime(expiresAt) > dateTime(now())
            ][0]
        `, { token })

        if (!invite) {
            console.error('❌ Einladung nicht gefunden oder abgelaufen')
            return NextResponse.json({
                message: 'Einladung nicht gefunden oder abgelaufen'
            }, { status: 400 })
        }

        // 2. Hole oder erstelle User
        const hashedPassword = await bcrypt.hash(invite.tempPassword, 10)
        let userId: string

        const existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: invite.email }
        )

        if (existingUser) {
            userId = existingUser._id
            // Update existierenden User
            await writeClient
                .patch(userId)
                .set({
                    name: invite.name,
                    telefon: invite.telefon,
                    position: invite.position,
                    password: hashedPassword,
                    role: 'billing',
                    aktiv: true,
                    updatedAt: new Date().toISOString()
                })
                .commit()
            console.log('✅ Existierender User aktualisiert:', userId)
        } else {
            // Erstelle neuen User
            const newUser = await writeClient.create({
                _type: 'user',
                name: invite.name,
                email: invite.email,
                telefon: invite.telefon,
                position: invite.position,
                password: hashedPassword,
                role: 'billing',
                aktiv: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            userId = newUser._id
            console.log('✅ Neuer User erstellt:', userId)
        }

        // 3. Hole das zugehörige Projekt
        const project = await writeClient.fetch<Project>(`
            *[_type == "projekte" && unternehmen._ref == $companyId][0]
        `, { companyId: invite.companyId })

        if (!project) {
            throw new Error('Projekt nicht gefunden')
        }

        // 4. Aktualisiere das Unternehmen
        await writeClient
            .patch(invite.companyId)
            .set({
                rechnungsempfaenger: {
                    _ref: userId,
                    _type: 'reference'
                }
            })
            .commit()
        console.log('✅ Unternehmen aktualisiert')

        // 5. Füge User zum Projekt hinzu
        const existingUsers = project.users || []
        const userRefs = existingUsers.map((u: UserReference) => u._ref)

        if (!userRefs.includes(userId)) {
            await writeClient
                .patch(project._id)
                .set({
                    users: [
                        ...existingUsers,
                        {
                            _type: 'reference',
                            _ref: userId,
                            _key: `${userId}-${Date.now()}`
                        }
                    ]
                })
                .commit()
        }
        console.log('✅ Projekt aktualisiert')

        // 6. Markiere Einladung als verwendet
        await writeClient
            .patch(invite._id)
            .set({
                usedAt: new Date().toISOString(),
                verifiedUserId: userId
            })
            .commit()
        console.log('✅ Einladung als verwendet markiert')

        return NextResponse.json({
            message: 'Verifizierung erfolgreich',
            success: true
        })

    } catch (error) {
        console.error('❌ Fehler bei der Verifizierung:', error)
        return NextResponse.json({
            message: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.',
            success: false
        }, { status: 500 })
    }
}