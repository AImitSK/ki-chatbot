// components/profile/TwoFactorSetup.tsx
'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

interface TwoFactorSetupProps {
    isEnabled?: boolean;
    recoveryCodesLeft?: number;
}

export function TwoFactorSetup({ isEnabled = false, recoveryCodesLeft = 0 }: TwoFactorSetupProps) {
    const [isSettingUp, setIsSettingUp] = useState(false)
    const [isDisabling, setIsDisabling] = useState(false)
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(false)
    const [qrUrl, setQrUrl] = useState<string>('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

    const handleStart2FASetup = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/user/2fa/setup', {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Setup fehlgeschlagen')
            }

            const data = await response.json()
            setQrUrl(data.otpauthUrl)
            setRecoveryCodes(data.recoveryCodes || [])
            setIsSettingUp(true)
        } catch (error) {
            showErrorToast('2FA Setup konnte nicht gestartet werden')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/user/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: verificationCode })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Verifizierung fehlgeschlagen')
            }

            showSuccessToast('2FA wurde erfolgreich aktiviert')
            // Seite neu laden um den aktualisierten Status zu zeigen
            window.location.reload()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Code konnte nicht verifiziert werden'
            showErrorToast(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDisable2FA = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/user/2fa/disable', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Deaktivierung fehlgeschlagen')
            }

            showSuccessToast('2FA wurde erfolgreich deaktiviert')
            window.location.reload()
        } catch (error) {
            showErrorToast('Fehler bei der Deaktivierung von 2FA')
        } finally {
            setIsLoading(false)
            setIsDisabling(false)
        }
    }

    const handleShowRecoveryCodes = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/user/2fa/recovery-codes')

            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Recovery Codes')
            }

            const data = await response.json()
            setRecoveryCodes(data.recoveryCodes)
            setShowingRecoveryCodes(true)
        } catch (error) {
            showErrorToast('Fehler beim Laden der Recovery Codes')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateNewRecoveryCodes = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/user/2fa/recovery-codes/generate', {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Fehler beim Generieren neuer Recovery Codes')
            }

            const data = await response.json()
            setRecoveryCodes(data.recoveryCodes)
            showSuccessToast('Neue Recovery Codes wurden generiert')
        } catch (error) {
            showErrorToast('Fehler beim Generieren neuer Recovery Codes')
        } finally {
            setIsLoading(false)
        }
    }

    if (isEnabled) {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-green-700">
                                Zwei-Faktor-Authentifizierung ist aktiviert
                            </p>
                        </div>
                        <Button
                            color="dark/zinc"
                            onClick={() => setIsDisabling(true)}
                        >
                            Deaktivieren
                        </Button>
                    </div>
                </div>

                {isDisabling && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">
                            2FA deaktivieren?
                        </h4>
                        <p className="text-sm text-yellow-700 mb-4">
                            Das Deaktivieren der Zwei-Faktor-Authentifizierung macht Ihr Konto weniger sicher.
                            Sind Sie sicher?
                        </p>
                        <div className="flex gap-2">
                            <Button
                                color="dark/zinc"
                                onClick={handleDisable2FA}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Wird deaktiviert...' : 'Ja, deaktivieren'}
                            </Button>
                            <Button
                                color="dark/zinc"
                                onClick={() => setIsDisabling(false)}
                                disabled={isLoading}
                            >
                                Abbrechen
                            </Button>
                        </div>
                    </div>
                )}

                {!isDisabling && (
                    <div className="bg-white p-4 rounded-lg border border-zinc-200">
                        <h4 className="font-medium mb-2">Recovery Codes</h4>
                        <p className="text-sm text-zinc-600 mb-4">
                            Recovery Codes können verwendet werden, wenn Sie keinen Zugriff auf Ihre Authenticator-App haben.
                            Jeder Code kann nur einmal verwendet werden.
                        </p>

                        {showingRecoveryCodes ? (
                            <div className="space-y-4">
                                <div className="bg-zinc-50 p-4 rounded-lg font-mono text-sm">
                                    {recoveryCodes.map((code, index) => (
                                        <div key={index} className="mb-1">{code}</div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        color="dark/zinc"
                                        onClick={handleGenerateNewRecoveryCodes}
                                        disabled={isLoading}
                                    >
                                        Neue Codes generieren
                                    </Button>
                                    <Button
                                        color="dark/zinc"
                                        onClick={() => setShowingRecoveryCodes(false)}
                                    >
                                        Ausblenden
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                color="dark/zinc"
                                onClick={handleShowRecoveryCodes}
                                disabled={isLoading}
                            >
                                Recovery Codes anzeigen
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    if (!isSettingUp) {
        return (
            <Button color="dark/zinc" onClick={handleStart2FASetup} disabled={isLoading}>
                {isLoading ? 'Wird vorbereitet...' : '2FA aktivieren'}
            </Button>
        )
    }

    return (
        <div className="space-y-6 max-w-md">
            <div className="space-y-4">
                <h4 className="font-medium">2FA Einrichtung</h4>

                <ol className="list-decimal list-inside space-y-6">
                    <li className="space-y-4">
                        <p className="text-sm text-zinc-600">
                            Scannen Sie den QR-Code mit Ihrer Authenticator-App<br />
                            (z.B. Google Authenticator, Authy)
                        </p>
                        <div className="bg-white p-4 inline-block rounded-lg shadow-sm">
                            <QRCodeSVG value={qrUrl} size={200} />
                        </div>
                    </li>

                    <li className="space-y-2">
                        <p className="text-sm text-zinc-600">
                            Geben Sie den 6-stelligen Code aus Ihrer App ein
                        </p>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={verificationCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                if (value.length <= 6) {
                                    setVerificationCode(value)
                                }
                            }}
                            placeholder="000000"
                            className="w-32 text-center tracking-wider"
                        />
                    </li>

                    {recoveryCodes.length > 0 && (
                        <li className="space-y-2">
                            <p className="text-sm text-zinc-600 font-medium">
                                Recovery Codes - Bitte sicher aufbewahren!
                            </p>
                            <div className="bg-zinc-50 p-4 rounded-lg font-mono text-sm">
                                {recoveryCodes.map((code, index) => (
                                    <div key={index} className="mb-1">{code}</div>
                                ))}
                            </div>
                            <p className="text-sm text-zinc-500">
                                Diese Codes können Sie verwenden, falls Sie keinen Zugriff auf Ihre Authenticator-App haben.
                                Jeder Code kann nur einmal verwendet werden.
                            </p>
                        </li>
                    )}
                </ol>
            </div>

            <div className="flex gap-2">
                <Button
                    color="dark/zinc"
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || isLoading}
                >
                    {isLoading ? 'Wird verifiziert...' : 'Bestätigen'}
                </Button>
                <Button
                    color="dark/zinc"
                    onClick={() => {
                        setIsSettingUp(false)
                        setQrUrl('')
                        setVerificationCode('')
                        setRecoveryCodes([])
                    }}
                    disabled={isLoading}
                >
                    Abbrechen
                </Button>
            </div>
        </div>
    )
}