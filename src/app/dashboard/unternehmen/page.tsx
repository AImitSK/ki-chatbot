// src/app/dashboard/unternehmen/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Heading } from '@/components/ui/heading'
import { CompanyContent } from '@/components/company/CompanyContent'
import { client } from '@/lib/sanity/client'

export default function UnternehmenPage() {
    const [companyData, setCompanyData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCompanyData() {
            try {
                const data = await client.fetch(`
                    *[_type == "unternehmen"][0] {
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
                    }
                `)
                setCompanyData(data)
            } catch (error) {
                console.error('Fehler beim Laden der Unternehmensdaten:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCompanyData()
    }, [])

    return (
        <div className="space-y-8">
            <Heading>Unternehmen</Heading>

            {loading ? <p>Lädt...</p> : companyData ? <CompanyContent initialData={companyData} /> : <p>Keine Daten gefunden</p>}
        </div>
    )
}
