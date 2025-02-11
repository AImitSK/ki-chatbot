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

        // Finde das Projekt mit diesem Rechnungsempfänger
        const project = await writeClient.fetch(
            `*[_type == "projekte" && rechnungsempfaenger._ref == $userId][0]._id`,
            { userId: params.id }
        )

        if (!project) {
            return new NextResponse('Project not found', { status: 404 })
        }

        // Setze temporär den Admin als Rechnungsempfänger
        const adminUser = await writeClient.fetch(
            `*[_type == "user" && role == "admin"][0]._id`
        )

        await writeClient
            .patch(project)
            .set({
                rechnungsempfaenger: {
                    _type: 'reference',
                    _ref: adminUser
                }
            })
            .commit()

        // Optional: User deaktivieren wenn er keine anderen Rollen hat
        const otherProjects = await writeClient.fetch(
            `*[_type == "projekte" && $userId in users[]._ref && _id != $projectId][0]._id`,
            {
                userId: params.id,
                projectId: project
            }
        )

        if (!otherProjects) {
            await writeClient
                .patch(params.id)
                .set({ aktiv: false })
                .commit()
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Fehler beim Löschen des Rechnungsempfängers:', error)
        return new NextResponse(
            'Fehler beim Löschen des Rechnungsempfängers',
            { status: 500 }
        )
    }
}