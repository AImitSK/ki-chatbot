'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { User } from '@/types'
import { BillingRecipientForm } from './BillingRecipientForm'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

interface BillingRecipientProps {
    companyId: string
    currentRecipient?: User
    onRecipientCreated?: (user: User) => void
}

export function BillingRecipient({
                                     companyId,
                                     currentRecipient,
                                     onRecipientCreated
                                 }: BillingRecipientProps) {
    const [isEditing, setIsEditing] = useState(false)

    const isAdminRecipient = currentRecipient?.role === 'admin'

    const handleSubmit = async (formData: {
        name: string
        email: string
        telefon?: string
        position?: string
    }) => {
        try {
            // Wenn kein currentRecipient oder Admin ist -> POST für neuen User
            const isNewUser = !currentRecipient || isAdminRecipient;

            const response = await fetch('/api/company/billing-recipient', {
                method: isNewUser ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isNewUser ? {
                    // Für neue User
                    ...formData,
                    companyId
                } : {
                    // Für Update existierender User
                    ...formData,
                    companyId,
                    userId: currentRecipient._id  // Hier senden wir die userId mit
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Ein Fehler ist aufgetreten')
            }

            const result = await response.json()

            if (isNewUser) {
                showSuccessToast('Einladung wurde an den neuen Rechnungsempfänger versendet.')
            } else {
                showSuccessToast('Rechnungsempfänger wurde aktualisiert')
            }

            if (onRecipientCreated) {
                onRecipientCreated(result.user)
            }

            setIsEditing(false)
        } catch (error) {
            showErrorToast(
                error instanceof Error
                    ? error.message
                    : 'Fehler beim Speichern des Rechnungsempfängers'
            )
        }
    }

    return (
        <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-lg font-medium">
                    {isAdminRecipient ? 'Rechnungsempfänger festlegen' : 'Rechnungsempfänger'}
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="text-white"
                    >
                        {isAdminRecipient ? 'Rechnungsempfänger anlegen' : 'Bearbeiten'}
                    </Button>
                )}
            </div>

            <div>
                {isEditing ? (
                    <div className="bg-zinc-50 rounded-lg p-4">
                        <BillingRecipientForm
                            initialData={!isAdminRecipient ? {
                                name: currentRecipient?.name || '',
                                email: currentRecipient?.email || '',
                                telefon: currentRecipient?.telefon || '',
                                position: currentRecipient?.position || ''
                            } : undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : isAdminRecipient ? (
                    <div className="bg-zinc-50 rounded-lg p-4">
                        <div className="text-zinc-500 text-sm">
                            Aktuell ist der Admin als Rechnungsempfänger eingetragen. Legen Sie einen dedizierten Rechnungsempfänger an.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-zinc-500">Name</div>
                            <div>{currentRecipient?.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500">E-Mail</div>
                            <div>{currentRecipient?.email}</div>
                        </div>
                        {currentRecipient?.telefon && (
                            <div>
                                <div className="text-sm text-zinc-500">Telefon</div>
                                <div>{currentRecipient?.telefon}</div>
                            </div>
                        )}
                        {currentRecipient?.position && (
                            <div>
                                <div className="text-sm text-zinc-500">Position</div>
                                <div>{currentRecipient?.position}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}