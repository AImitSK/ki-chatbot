// app/dashboard/profil/verify-email/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'
import { signOut } from 'next-auth/react'

export default function VerifyEmailPage() {
    const [isVerifying, setIsVerifying] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                showErrorToast('Ungültiger Token')
                router.push('/dashboard/profil')
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
                    throw new Error(data.error || data.message)
                }

                showSuccessToast('Email wurde erfolgreich geändert. Bitte melden Sie sich erneut an.')
                await signOut({ callbackUrl: '/auth/login' })
            } catch (error) {
                showErrorToast(error instanceof Error ? error.message : 'Verifizierung fehlgeschlagen')
                router.push('/dashboard/profil')
            } finally {
                setIsVerifying(false)
            }
        }

        verifyEmail()
    }, [token, router])

    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                    {isVerifying ? 'Email wird verifiziert...' : 'Verifizierung abgeschlossen'}
                </h2>
                <p className="text-zinc-500">Sie werden weitergeleitet...</p>
            </div>
        </div>
    )
}