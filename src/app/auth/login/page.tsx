// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heading } from '@/components/ui/heading'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            })

            if (result?.error === '2FA_REQUIRED') {
                // Wenn 2FA erforderlich ist, zur Verifizierungsseite weiterleiten
                router.push(`/auth/verify-2fa?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`)
                return
            }

            if (result?.error) {
                setError('Ungültige Email oder Passwort')
            } else {
                router.push(callbackUrl)
            }
        } catch (error) {
            setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm">
                <div className="text-center">
                    <Heading>SK Online Marketing</Heading>
                    <p className="mt-2 text-zinc-600">Melden Sie sich in Ihrem Account an</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="w-full"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passwort"
                                required
                                className="w-full"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Wird geladen...' : 'Anmelden'}
                    </Button>
                </form>
            </div>
        </div>
    )
}