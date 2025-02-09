// src/app/dashboard/unternehmen/page.tsx
import { Heading } from '@/components/ui/heading'
import { CompanyContent } from '@/components/company/CompanyContent'
import { writeClient } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UnternehmenPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/auth/login')
    }

    try {
        // Admin sieht alle Unternehmen, normale User nur ihre eigenen
        const query = session.user.role === 'admin'
            ? `*[_type == "unternehmen"][0]`
            : `*[_type == "unternehmen" && _id in *[_type == "projekte" && $userId in users[]._ref].unternehmen._ref][0]`

        const companyData = await writeClient.fetch(query, {
            userId: session.user.id
        })

        if (!companyData) {
            return (
                <div className="space-y-8">
                    <Heading>Unternehmen</Heading>
                    <p className="text-zinc-500">Keine Unternehmensdaten gefunden</p>
                </div>
            )
        }

        return (
            <div className="space-y-8">
                <Heading>Unternehmen</Heading>
                <CompanyContent initialData={companyData} />
            </div>
        )
    } catch (error) {
        console.error('Fehler beim Laden der Unternehmensdaten:', error)
        return (
            <div className="space-y-8">
                <Heading>Unternehmen</Heading>
                <p className="text-red-500">Fehler beim Laden der Daten</p>
            </div>
        )
    }
}