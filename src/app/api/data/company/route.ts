// src/app/api/data/company/route.ts
import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()

        // Admin darf alles
        if (session.user.role === 'admin') {
            const updatedCompany = await writeClient
                .patch(body._id)
                .set(body)
                .commit()
            return NextResponse.json(updatedCompany)
        }

        // Für normale User: Prüfe ob sie Zugriff auf das Unternehmen haben
        interface CompanyProject {
            _id: string
            companyId: string
        }
        const userProjects = await writeClient.fetch<CompanyProject[]>(`
            *[_type == "projekte" && $userId in users[]._ref] {
                _id,
                "companyId": unternehmen._ref
            }
        `, { userId: session.user.id })

        const hasAccess = userProjects.some((project: CompanyProject) => project.companyId === body._id)

        if (!hasAccess) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const updatedCompany = await writeClient
            .patch(body._id)
            .set(body)
            .commit()

        return NextResponse.json(updatedCompany)
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Unternehmensdaten:', error)
        return NextResponse.json(
            { error: 'Fehler beim Speichern' },
            { status: 500 }
        )
    }
}