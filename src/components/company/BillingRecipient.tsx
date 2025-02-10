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
    const [isCreating, setIsCreating] = useState(false)

    const handleSubmit = async (data: {
        name: string
        email: string
        telefon?: string
        position?: string
    }) => {
        try {
            const response = await fetch('/api/company/billing-recipient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    companyId
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Ein Fehler ist aufgetreten')
            }

            const result = await response.json()
            showSuccessToast(
                'Rechnungsempfänger wurde angelegt. Das temporäre Passwort lautet: ' +
                result.tempPassword
            )

            if (onRecipientCreated) {
                onRecipientCreated(result.user)
            }

            setIsCreating(false)
        } catch (error) {
            showErrorToast(
                error instanceof Error
                    ? error.message
                    : 'Fehler beim Anlegen des Rechnungsempfängers'
            )
        }
    }

    return (
        <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-lg font-medium">Rechnungsempfänger</div>
                {!currentRecipient && !isCreating && (
                    <Button
                        onClick={() => setIsCreating(true)}
                    >
                        Rechnungsempfänger anlegen
                    </Button>
                )}
            </div>

            {currentRecipient ? (
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-zinc-500">Name</div>
                        <div>{currentRecipient.name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-500">E-Mail</div>
                        <div>{currentRecipient.email}</div>
                    </div>
                    {currentRecipient.telefon && (
                        <div>
                            <div className="text-sm text-zinc-500">Telefon</div>
                            <div>{currentRecipient.telefon}</div>
                        </div>
                    )}
                    {currentRecipient.position && (
                        <div>
                            <div className="text-sm text-zinc-500">Position</div>
                            <div>{currentRecipient.position}</div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-zinc-50 rounded-lg p-4">
                    {isCreating ? (
                        <BillingRecipientForm
                            onSubmit={handleSubmit}
                            onCancel={() => setIsCreating(false)}
                        />
                    ) : (
                        <div className="text-zinc-500 text-sm">
                            Noch kein Rechnungsempfänger festgelegt
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}