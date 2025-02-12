// src/components/company/BillingRecipient.tsx
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
    const [isDeleting, setIsDeleting] = useState(false)

    const isAdminRecipient = currentRecipient?.role === 'admin'

    const handleDelete = async () => {
        if (!currentRecipient) return;

        try {
            setIsDeleting(true);
            const sure = window.confirm(
                'Möchten Sie wirklich den Rechnungsempfänger löschen? Der Admin wird temporär als Rechnungsempfänger eingesetzt.'
            );

            if (!sure) return;

            const response = await fetch(`/api/company/billing-recipient/${currentRecipient._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Rechnungsempfängers');
            }

            showSuccessToast('Rechnungsempfänger wurde erfolgreich gelöscht');
            if (onRecipientCreated) {
                onRecipientCreated(undefined as any); // Trigger refresh
            }
        } catch (error) {
            showErrorToast(
                error instanceof Error
                    ? error.message
                    : 'Fehler beim Löschen des Rechnungsempfängers'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (formData: {
        name: string
        email: string
        telefon?: string
        position?: string
    }) => {
        try {
            const isNewUser = !currentRecipient || isAdminRecipient;

            const response = await fetch('/api/company/billing-recipient', {
                method: isNewUser ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isNewUser ? {
                    ...formData,
                    companyId
                } : {
                    ...formData,
                    companyId,
                    userId: currentRecipient._id
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

    console.log('BillingRecipient props:', { companyId, currentRecipient, isAdminRecipient });

    return (
        <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-lg font-medium">
                    {isAdminRecipient ? 'Rechnungsempfänger festlegen' : 'Rechnungsempfänger'}
                </div>
                <div className="flex gap-2">
                    {!isEditing && !isAdminRecipient && currentRecipient && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                        </Button>
                    )}
                    {!isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="text-white"
                        >
                            {isAdminRecipient ? 'Rechnungsempfänger anlegen' : 'Bearbeiten'}
                        </Button>
                    )}
                </div>
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