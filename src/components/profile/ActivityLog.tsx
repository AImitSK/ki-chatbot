// src/components/profile/ActivityLog.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import useSWR from 'swr'
import { fetcher } from '@/lib/swr/fetcher'

interface Activity {
    _id: string
    activityType: string
    timestamp: string
    ipAddress?: string
    userAgent?: string
    details?: string
}

const activityTypeLabels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    password_change: 'Passwort geändert',
    password_change_failed: 'Passwortänderung fehlgeschlagen',
    profile_update: 'Profil aktualisiert',
    '2fa_enabled': '2FA aktiviert',
    '2fa_disabled': '2FA deaktiviert',
    login_failed: 'Fehlgeschlagener Login',
    test: 'Test'
}

export function ActivityLog() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: activities, error } = useSWR<Activity[]>(
        isOpen ? '/api/user/activity' : null,
        fetcher
    )

    const loading = isOpen && !activities && !error

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2"
            >
                Aktivitäten anzeigen
            </button>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                size="2xl"
            >
                <DialogTitle>Sicherheitsprotokoll</DialogTitle>

                <DialogBody>
                    <div className="space-y-4">
                        {loading && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
                            </div>
                        )}

                        {error && (
                            <div className="text-center text-red-500 py-4">
                                Fehler beim Laden der Aktivitäten
                            </div>
                        )}

                        {activities && activities.length === 0 && (
                            <div className="text-center text-zinc-500 py-4">
                                Keine Aktivitäten gefunden
                            </div>
                        )}

                        {activities && activities.length > 0 && (
                            <div className="space-y-4">
                                {activities.map((activity: Activity) => (
                                    <div
                                        key={activity._id}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">
                                                    {activityTypeLabels[activity.activityType]}
                                                </h4>
                                                <p className="text-sm text-zinc-500">
                                                    {format(new Date(activity.timestamp), 'PPpp', { locale: de })}
                                                </p>
                                            </div>
                                        </div>
                                        {activity.ipAddress && (
                                            <p className="text-sm text-zinc-600">
                                                IP: {activity.ipAddress}
                                            </p>
                                        )}
                                        {activity.details && (
                                            <p className="text-sm text-zinc-600">
                                                {activity.details}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogBody>
            </Dialog>
        </>
    )
}