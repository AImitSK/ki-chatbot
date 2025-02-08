// app/auth/verify-2fa/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showErrorToast, showSuccessToast } from '@/components/ui/toast'
import { signIn } from 'next-auth/react'
import { Heading } from '@/components/ui/heading'

export default function Verify2FAPage() {
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [rememberDevice, setRememberDevice] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (code.length !== 6 && code.length !== 8) {
            showErrorToast('Bitte geben Sie einen gültigen Code ein')
            return
        }

        try {
            setIsLoading(true)

            // 2FA-Code oder Recovery Code verifizieren
            const verifyResponse = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code
                })
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
                throw new Error(verifyData.message || 'Verifizierung fehlgeschlagen')
            }

            // Nach erfolgreicher Verifizierung einloggen
            const signInResult = await signIn('credentials', {
                redirect: false,
                email,
                twoFactorVerified: 'true',
                callbackUrl,
                // Setze die Session-Dauer direkt hier
                maxAge: rememberDevice ? 30 * 24 * 60 * 60 : undefined // 30 Tage oder Standard
            })

            if (signInResult?.error) {
                throw new Error(signInResult.error)
            }

            showSuccessToast('Erfolgreich verifiziert')
            router.push(callbackUrl)

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Code konnte nicht verifiziert werden'
            showErrorToast(message)
            setCode('')
        } finally {
            setIsLoading(false)
        }
    }

    // Rest der Komponente bleibt gleich
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm">
                <div className="text-center">
                    <Heading>Zwei-Faktor-Authentifizierung</Heading>
                    <p className="mt-2 text-zinc-600">
                        Bitte geben Sie den Code aus Ihrer Authenticator-App oder einen Recovery Code ein.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <Input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase()
                                if (value.length <= 8) {
                                    setCode(value)
                                }
                            }}
                            placeholder="Code eingeben"
                            className="text-center tracking-wider text-xl"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberDevice"
                            checked={rememberDevice}
                            onChange={(e) => setRememberDevice(e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-600">
                            Dieses Gerät für 30 Tage merken
                        </label>
                    </div>

                    <Button
                        type="submit"
                        color="dark/zinc"
                        className="w-full"
                        disabled={(code.length !== 6 && code.length !== 8) || isLoading}
                    >
                        {isLoading ? 'Wird verifiziert...' : 'Bestätigen'}
                    </Button>
                </form>
            </div>
        </div>
    )
}