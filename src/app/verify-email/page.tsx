// app/verify-email/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error')
                return
            }

            try {
                const response = await fetch('/api/user/email/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message)
                }

                setStatus('success')
                showSuccessToast('Email-Adresse wurde erfolgreich geändert')
            } catch (err) {
                setStatus('error')
                const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
                showErrorToast(message)
            }
        }

        verifyEmail()
    }, [token])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">
                        {status === 'loading' && 'Email wird verifiziert...'}
                        {status === 'success' && 'Email erfolgreich verifiziert!'}
                        {status === 'error' && 'Verifizierung fehlgeschlagen'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {status === 'loading' && 'Bitte warten Sie einen Moment.'}
                        {status === 'success' && 'Ihre Email-Adresse wurde erfolgreich aktualisiert.'}
                        {status === 'error' && 'Der Verifizierungslink ist ungültig oder abgelaufen.'}
                    </p>
                    <Button
                        color="dark/zinc"
                        onClick={() => router.push('/dashboard/profil')}
                    >
                        Zurück zum Profil
                    </Button>
                </div>
            </div>
        </div>
    )
}