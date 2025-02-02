// components/profile/ProfileClient.tsx
'use client'

import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Heading, Subheading } from '@/components/ui/heading'
import { useState } from 'react'
import { AvatarUpload } from './AvatarUpload'
import { EditProfileForm } from './EditProfileForm'  // Neuer Import

interface ProfileClientProps {
    userData: User
}

export function ProfileClient({ userData: initialUserData }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState(initialUserData)

    async function handleSave(data: Partial<User>) {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Fehler beim Speichern')
            }

            setUserData(prev => ({ ...prev, ...data }))
            setIsEditing(false)
        } catch (error) {
            console.error('Fehler beim Speichern:', error)
        }
    }

    return (
        <div className="space-y-8">
            {/* Avatar und Name Sektion */}
            <div className="bg-white p-6 rounded">
                <AvatarUpload
                    userData={userData}
                    onAvatarUpdate={(newUserData: User) => {
                        setUserData(newUserData)
                    }}
                />
                <div className="mt-4">
                    <Heading level={2}>{userData.name}</Heading>
                    <p className="text-zinc-500">{userData.position || 'Keine Position angegeben'}</p>
                </div>
            </div>

            {/* Kontaktinformationen */}
            <div className="bg-white p-6 rounded">
                <div className="flex justify-between items-center mb-6">
                    <Subheading>Kontaktinformationen</Subheading>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Abbrechen' : 'Bearbeiten'}
                    </Button>
                </div>

                {isEditing ? (
                    <EditProfileForm
                        user={userData}
                        onCancel={() => setIsEditing(false)}
                        onSave={handleSave}
                    />
                ) : (
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-zinc-500">E-Mail</div>
                            <div className="mt-1 font-medium">{userData.email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500">Telefon</div>
                            <div className="mt-1 font-medium">{userData.telefon || 'Nicht angegeben'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-zinc-500">Position</div>
                            <div className="mt-1 font-medium">{userData.position || 'Nicht angegeben'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Kontoeinstellungen */}
            <div className="bg-white p-6 rounded">
                <Subheading className="mb-6">Kontoeinstellungen</Subheading>
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-zinc-500">Rolle</div>
                        <div className="mt-1 font-medium">{userData.role}</div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-500">Status</div>
                        <div className="mt-1 font-medium">{userData.aktiv ? 'Aktiv' : 'Inaktiv'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-500">Letzter Login</div>
                        <div className="mt-1 font-medium">
                            {userData.lastLogin
                                ? new Date(userData.lastLogin).toLocaleString('de-DE')
                                : 'Nicht verfügbar'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sicherheitseinstellungen */}
            <div className="bg-white p-6 rounded">
                <Subheading className="mb-6">Sicherheit</Subheading>
                <Button>
                    Passwort ändern
                </Button>
            </div>
        </div>
    )
}