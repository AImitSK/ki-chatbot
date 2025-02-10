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
            ? `*[_type == "projekte"][0]{
                unternehmen->{
                    _id,
                    name,
                    strasse,
                    plz,
                    ort,
                    land,
                    ustIdNr,
                    telefon,
                    email,
                    webseite
                },
                rechnungsempfaenger->{
                    _id,
                    name,
                    email,
                    telefon,
                    position,
                    role,
                    aktiv
                }
            }.unternehmen`
            : `*[_type == "projekte" && $userId in users[]._ref][0]{
                unternehmen->{
                    _id,
                    name,
                    strasse,
                    plz,
                    ort,
                    land,
                    ustIdNr,
                    telefon,
                    email,
                    webseite
                },
                rechnungsempfaenger->{
                    _id,
                    name,
                    email,
                    telefon,
                    position,
                    role,
                    aktiv
                }
            }.unternehmen`

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

        // Hole den Rechnungsempfänger für dieses Unternehmen
        const recipientQuery = `*[_type == "projekte" && unternehmen._ref == $companyId][0].rechnungsempfaenger->{
            _id,
            name,
            email,
            telefon,
            position,
            role,
            aktiv
        }`

        const rechnungsempfaenger = await writeClient.fetch(recipientQuery, {
            companyId: companyData._id
        })

        // Füge den Rechnungsempfänger zu den Unternehmensdaten hinzu
        const companyWithRecipient = {
            ...companyData,
            rechnungsempfaenger
        }

        return (
            <div className="space-y-8">
                <Heading>Unternehmen</Heading>
                <CompanyContent initialData={companyWithRecipient} />
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