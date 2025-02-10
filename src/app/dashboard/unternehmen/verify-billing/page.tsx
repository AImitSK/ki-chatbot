'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { showSuccessToast, showErrorToast, showWarningToast } from '@/components/ui/toast'
import { useSession, signOut } from 'next-auth/react'

export default function VerifyBillingPage() {
    const [isVerifying, setIsVerifying] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const { data: session } = useSession()

    console.log('--- Token aus der URL:', token);
    console.log('--- Aktuelle Session:', session);

    useEffect(() => {
        if (session) {
            showWarningToast('Bitte loggen Sie sich aus, um die Verifizierung durchzuführen.');
            setTimeout(() => signOut(), 2000); // Automatisch ausloggen
            return;
        }

        const verifyInvitation = async () => {
            if (!token) {
                showErrorToast('Ungültiger Token')
                router.push('/auth/login')
                return
            }

            try {
                console.log('--- Sende Anfrage zur Token-Verifizierung an /api/billing/verify');

                const response = await fetch('/api/billing/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                })

                const data = await response.json()
                console.log('--- Antwort von /api/billing/verify:', data);

                if (!response.ok) {
                    throw new Error(data.error || data.message)
                }

                showSuccessToast('Account wurde erfolgreich aktiviert. Sie können sich jetzt anmelden.')
                router.push('/auth/login')
            } catch (error) {
                console.error('❌ Fehler bei der Token-Verifizierung:', error);
                showErrorToast(error instanceof Error ? error.message : 'Verifizierung fehlgeschlagen')
                router.push('/auth/login')
            } finally {
                setIsVerifying(false)
            }
        }

        verifyInvitation()
    }, [token, router, session])

    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                    {isVerifying ? 'Account wird aktiviert...' : 'Aktivierung abgeschlossen'}
                </h2>
                <p className="text-zinc-500">Sie werden weitergeleitet...</p>
            </div>
        </div>
    )
}
