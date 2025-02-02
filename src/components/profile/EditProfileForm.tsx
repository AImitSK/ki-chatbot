// components/profile/EditProfileForm.tsx
'use client'

import { User } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface EditProfileFormProps {
    user: User
    onCancel: () => void
    onSave: (data: Partial<User>) => Promise<void>
}

export function EditProfileForm({ user, onCancel, onSave }: EditProfileFormProps) {
    const [name, setName] = useState(user.name)
    const [telefon, setTelefon] = useState(user.telefon || '')
    const [position, setPosition] = useState(user.position || '')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            await onSave({
                name,
                telefon,
                position
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <div className="text-sm text-zinc-500 mb-1">Name</div>
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div>
                <div className="text-sm text-zinc-500 mb-1">Telefon</div>
                <Input
                    type="tel"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                />
            </div>

            <div>
                <div className="text-sm text-zinc-500 mb-1">Position</div>
                <Input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
                <Button type="button" onClick={onCancel} disabled={isLoading}>
                    Abbrechen
                </Button>
            </div>
        </form>
    )
}