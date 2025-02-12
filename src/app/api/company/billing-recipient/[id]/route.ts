// app/api/company/billing-recipient/[id]/route.ts
import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Hole Admin als Fallback-Rechnungsempfänger
        const adminUser = await writeClient.fetch(`
            *[_type == "user" && role == "admin"][0]._id
        `)

        // Setze Admin als temporären Rechnungsempfänger
        const company = await writeClient.fetch(`
            *[_type == "projekte" && references($userId)][0].unternehmen._ref
        `, { userId: params.id })

        if (company) {
            await writeClient
                .patch(company)
                .set({
                    rechnungsempfaenger: {
                        _ref: adminUser,
                        _type: 'reference'
                    }
                })
                .commit()
        }

        // User deaktivieren statt löschen
        await writeClient
            .patch(params.id)
            .set({ aktiv: false })
            .commit()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Fehler beim Löschen:', error)
        return NextResponse.json(
            { message: 'Fehler beim Löschen des Rechnungsempfängers' },
            { status: 500 }
        )
    }
}