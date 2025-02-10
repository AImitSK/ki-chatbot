// src/components/company/BillingRecipientForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'

interface FormData {
    name: string
    email: string
    telefon: string
    position: string
}

interface BillingRecipientFormProps {
    initialData?: FormData
    onSubmit: (data: FormData) => Promise<void>
    onCancel: () => void
}

export function BillingRecipientForm({ initialData, onSubmit, onCancel }: BillingRecipientFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        telefon: initialData?.telefon || '',
        position: initialData?.position || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await onSubmit(formData)
        } catch (error) {
            console.error('Fehler beim Speichern des Rechnungsempfängers:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                />
            </div>

            <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                />
            </div>

            <div>
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                    id="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                />
            </div>

            <div>
                <Label htmlFor="position">Position</Label>
                <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                />
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="text-white"
                >
                    {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="text-white"
                >
                    Abbrechen
                </Button>
            </div>
        </form>
    )
}