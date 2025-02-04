// src/components/forms/CompanyForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/Label'

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

interface CompanyFormProps {
    initialData: CompanyData
    onCancel: () => void
    onSave: (data: Partial<CompanyData>) => Promise<void>
}

export function CompanyForm({ initialData, onCancel, onSave }: CompanyFormProps) {
    const [formData, setFormData] = useState<CompanyData>(initialData)
    const [isSaving, setIsSaving] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        await onSave(formData)
        setIsSaving(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Unternehmensname</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="strasse">Straße</Label>
                <Input id="strasse" name="strasse" value={formData.strasse} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="plz">PLZ</Label>
                    <Input id="plz" name="plz" value={formData.plz} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="ort">Ort</Label>
                    <Input id="ort" name="ort" value={formData.ort} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="land">Land</Label>
                    <Input id="land" name="land" value={formData.land} onChange={handleChange} required />
                </div>
            </div>
            <div>
                <Label htmlFor="ustIdNr">USt-IDNr.</Label>
                <Input id="ustIdNr" name="ustIdNr" value={formData.ustIdNr || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="telefon">Telefon</Label>
                <Input id="telefon" name="telefon" value={formData.telefon || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="webseite">Webseite</Label>
                <Input id="webseite" name="webseite" type="url" value={formData.webseite || ''} onChange={handleChange} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Speichert...' : 'Speichern'}
                </Button>
                <Button type="button" onClick={onCancel} disabled={isSaving}>
                    Abbrechen
                </Button>
            </div>
        </form>
    )
}
