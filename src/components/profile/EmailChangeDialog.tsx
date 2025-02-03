// components/profile/EmailChangeDialog.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

interface EmailChangeDialogProps {
    currentEmail: string
    onClose: () => void
}

export function EmailChangeDialog({ currentEmail, onClose }: EmailChangeDialogProps) {
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (newEmail === currentEmail) {
            setError('Die neue E-Mail-Adresse muss sich von der aktuellen unterscheiden')
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch('/api/user/email/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            showSuccessToast('Bestätigungs-E-Mail wurde gesendet. Bitte überprüfen Sie Ihren Posteingang.')
            onClose()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
            showErrorToast(errorMessage)
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">E-Mail-Adresse ändern</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-zinc-500 mb-1">
                            Aktuelle E-Mail-Adresse
                        </label>
                        <Input
                            type="email"
                            value={currentEmail}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-500 mb-1">
                            Neue E-Mail-Adresse
                        </label>
                        <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-500 mb-1">
                            Passwort zur Bestätigung
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            color="dark/zinc"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wird gesendet...' : 'Bestätigen'}
                        </Button>
                        <Button
                            type="button"
                            color="dark/zinc"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Abbrechen
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}