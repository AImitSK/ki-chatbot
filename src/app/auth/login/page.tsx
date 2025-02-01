// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Heading } from '@/components/ui/heading'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('sanity-login', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Ungültige Email oder Passwort')
            } else {
                router.push('/dashboard')
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
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
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

                    <div className="text-sm text-center text-zinc-600">
                        <a href="/auth/reset-password" className="hover:text-zinc-900">
                            Passwort vergessen?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}