// components/profile/SecuritySettings.tsx
'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validatePassword } from '@/lib/validation/password' // Neuer Import
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

interface SecuritySettingsProps {
    user: User
}

export const SecuritySettings = ({ user }: SecuritySettingsProps) => {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validiere das neue Passwort
        const validation = validatePassword(newPassword)
        if (!validation.isValid) {
            setError(validation.message)  // Jetzt ist message immer definiert
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Die Passwörter stimmen nicht überein')
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch('/api/user/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            showSuccessToast('Passwort wurde erfolgreich geändert')
            setIsChangingPassword(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
            showErrorToast(errorMessage)
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Sicherheitseinstellungen</h3>

            <div className="space-y-8">
                <div>
                    <div className="text-sm text-zinc-500">Passwort</div>
                    {isChangingPassword ? (
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-zinc-500 mb-1">
                                    Aktuelles Passwort
                                </label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-500 mb-1">
                                    Neues Passwort
                                </label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-500 mb-1">
                                    Passwort wiederholen
                                </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" color="dark/zinc" disabled={isLoading}>
                                    {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                                </Button>
                                <Button
                                    type="button"
                                    color="dark/zinc"
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        setError(null)
                                        setCurrentPassword('')
                                        setNewPassword('')
                                        setConfirmPassword('')
                                    }}
                                    disabled={isLoading}
                                >
                                    Abbrechen
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <Button color="dark/zinc" onClick={() => setIsChangingPassword(true)}>
                            Passwort ändern
                        </Button>
                    )}
                </div>

                <div>
                    <div className="text-sm text-zinc-500">Zwei-Faktor-Authentifizierung</div>
                    <p className="text-sm text-zinc-600 mb-2">
                        Erhöhen Sie die Sicherheit Ihres Kontos durch eine zusätzliche Authentifizierungsebene.
                    </p>
                    <Button color="dark/zinc">
                        2FA aktivieren
                    </Button>
                </div>

                <div>
                    <div className="text-sm text-zinc-500">Sicherheitsprotokoll</div>
                    <p className="text-sm text-zinc-600 mb-2">
                        Überprüfen Sie die letzten Aktivitäten Ihres Kontos.
                    </p>
                    <Button color="dark/zinc">
                        Aktivitäten anzeigen
                    </Button>
                </div>
            </div>
        </div>
    )
}