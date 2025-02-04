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

        if (code.length !== 6) {
            showErrorToast('Bitte geben Sie einen 6-stelligen Code ein')
            return
        }

        try {
            setIsLoading(true)

            // 2FA-Code verifizieren
            const verifyResponse = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                    rememberDevice
                })
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
                throw new Error(verifyData.message || 'Verifizierung fehlgeschlagen')
            }

            // Nach erfolgreicher Verifizierung einloggen
            const signInResult = await signIn('credentials', {
                email,
                twoFactorVerified: 'true',
                rememberDevice: rememberDevice ? 'true' : 'false',
                redirect: false,
                callbackUrl
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm">
                <div className="text-center">
                    <Heading>Zwei-Faktor-Authentifizierung</Heading>
                    <p className="mt-2 text-zinc-600">
                        Bitte geben Sie den Code aus Ihrer Authenticator-App ein.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                if (value.length <= 6) {
                                    setCode(value)
                                }
                            }}
                            placeholder="000000"
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
                        disabled={code.length !== 6 || isLoading}
                    >
                        {isLoading ? 'Wird verifiziert...' : 'Bestätigen'}
                    </Button>
                </form>
            </div>
        </div>
    )
}