// src/components/company/CompanyContent.tsx
'use client'

import { useState } from 'react'
import { CompanyForm } from '@/components/forms/CompanyForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'

interface CompanyData {
    _id: string
    name: string
    strasse: string
    plz: string
    ort: string
    land: string
    ustIdNr?: string
    telefon?: string
    email?: string
    webseite?: string
}

interface CompanyContentProps {
    initialData: CompanyData
}

export function CompanyContent({ initialData }: CompanyContentProps) {
    const [companyData, setCompanyData] = useState(initialData)
    const [isEditing, setIsEditing] = useState(false)

    const handleCompanyUpdate = async (data: Partial<CompanyData>) => {
        try {
            const response = await fetch('/api/data/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...companyData, ...data }),
            })

            if (!response.ok) throw new Error('Speichern fehlgeschlagen')

            const updatedCompany = await response.json()
            setCompanyData(updatedCompany) // Aktualisierte Daten setzen
        } catch (error) {
            console.error('Fehler beim Speichern:', error)
        }
    }

    return (
        <Card className="p-6 space-y-6">
            {/* Header mit Titel und Button */}
            <div className="flex justify-between items-center">
                <div className="text-lg font-medium">Unternehmensdaten</div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        Bearbeiten
                    </Button>
                )}
            </div>

            {/* Inhalt: Vorschau oder Formular */}
            {!isEditing ? (
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-zinc-500">Unternehmensname</div>
                        <div>{companyData.name || 'Keine Daten verfügbar'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-500">Adresse</div>
                        <div>
                            {companyData.strasse || '-'}, {companyData.plz || '-'} {companyData.ort || '-'}, {companyData.land || '-'}
                        </div>
                    </div>
                    {companyData.ustIdNr && (
                        <div>
                            <div className="text-sm text-zinc-500">USt-IDNr.</div>
                            <div>{companyData.ustIdNr}</div>
                        </div>
                    )}
                    {companyData.telefon && (
                        <div>
                            <div className="text-sm text-zinc-500">Telefon</div>
                            <div>{companyData.telefon}</div>
                        </div>
                    )}
                    {companyData.email && (
                        <div>
                            <div className="text-sm text-zinc-500">E-Mail</div>
                            <div>{companyData.email}</div>
                        </div>
                    )}
                    {companyData.webseite && (
                        <div>
                            <div className="text-sm text-zinc-500">Webseite</div>
                            <div>{companyData.webseite}</div>
                        </div>
                    )}
                </div>
            ) : (
                <CompanyForm
                    initialData={companyData}
                    onCancel={() => setIsEditing(false)}
                    onSave={async (data) => {
                        await handleCompanyUpdate(data)
                        setIsEditing(false)
                    }}
                />
            )}
        </Card>
    )
}
