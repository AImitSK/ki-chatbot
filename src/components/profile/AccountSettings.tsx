// components/profile/AccountSettings.tsx
'use client'

import { User } from '@/types'
import { Button } from '@/components/ui/button'

interface AccountSettingsProps {
    user: User
}

export const AccountSettings = ({ user }: AccountSettingsProps) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Kontoeinstellungen</h3>

            <div className="space-y-4">
                <div>
                    <div className="text-sm text-zinc-500">E-Mail</div>
                    <div className="flex items-center justify-between">
                        <div>{user.email}</div>
                        <Button color="dark/zinc">
                            E-Mail ändern
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-zinc-500">Rolle</div>
                    <div>{user.role === 'admin' ? 'Administrator' : 'Benutzer'}</div>
                </div>

                <div>
                    <div className="text-sm text-zinc-500">Konto erstellt</div>
                    <div>{new Date(user.createdAt).toLocaleDateString('de-DE')}</div>
                </div>

                <div>
                    <div className="text-sm text-zinc-500">Letzte Anmeldung</div>
                    <div>{new Date(user.lastLogin || Date.now()).toLocaleDateString('de-DE')}</div>
                </div>
            </div>
        </div>
    )
}