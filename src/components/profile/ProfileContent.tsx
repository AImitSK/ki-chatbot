// components/profile/ProfileContent.tsx
'use client'

import { useState } from 'react'
import { User } from '@/types'
import { AvatarUpload } from './AvatarUpload'
import { EditProfileForm } from './EditProfileForm'
import { AccountSettings } from './AccountSettings'
import { SecuritySettings } from './SecuritySettings'
import { Button } from '@/components/ui/button'

interface ProfileContentProps {
    initialUserData: User | null
}

export function ProfileContent({ initialUserData }: ProfileContentProps) {
    const [userData, setUserData] = useState<User | null>(initialUserData)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAvatarUpdate = async (newUserData: User) => {
        setUserData(newUserData)
    }

    const handleProfileUpdate = async (data: Partial<User>) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Update fehlgeschlagen')

            const updatedUser = await response.json()
            setUserData(updatedUser)
            setIsEditing(false)
        } catch (error) {
            console.error('Fehler beim Update:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Wenn keine Benutzerdaten vorhanden sind, zeige einen Ladezustand oder Fehlermeldung
    if (!userData) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-zinc-500">Benutzerdaten konnten nicht geladen werden</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Profil</h1>
            </div>

            <div className="grid gap-6">
                {/* Avatar Sektion */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">Profilbild</h2>
                    <AvatarUpload
                        userData={userData}
                        onAvatarUpdate={handleAvatarUpdate}
                    />
                </section>

                {/* Persönliche Daten Sektion */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Persönliche Daten</h2>
                        {!isEditing && !isLoading && (
                            <Button onClick={() => setIsEditing(true)}>
                                Bearbeiten
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        <EditProfileForm
                            user={userData}
                            onCancel={() => {
                                setIsEditing(false)
                                setUserData(initialUserData)
                            }}
                            onSave={async (data) => {
                                await handleProfileUpdate(data)
                            }}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-zinc-500">Name</div>
                                <div>{userData.name || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-zinc-500">Telefon</div>
                                <div>{userData.telefon || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-zinc-500">Position</div>
                                <div>{userData.position || '-'}</div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Kontoeinstellungen */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <AccountSettings user={userData} />
                </section>

                {/* Sicherheitseinstellungen */}
                <section className="bg-white p-6 rounded-lg shadow">
                    <SecuritySettings user={userData} />
                </section>
            </div>
        </div>
    )
}