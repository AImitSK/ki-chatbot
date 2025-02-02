// components/profile/AvatarUpload.tsx
'use client'

import { User } from '@/types'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useState, useRef } from 'react'

interface AvatarUploadProps {
    userData: User;
    onAvatarUpdate: (newUserData: User) => void;
}

export function AvatarUpload({ userData, onAvatarUpdate }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Fehler beim Upload')
            }

            const updatedUser = await response.json()
            onAvatarUpdate(updatedUser)
        } catch (error) {
            console.error('Avatar upload error:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar
                    src={userData.avatar?.asset?._ref ? `/api/sanity/image/${userData.avatar.asset._ref}` : '/placeholder-avatar.png'}
                    className="size-20"
                    alt={userData.name}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? 'Wird hochgeladen...' : 'Bild ändern'}
                </Button>
            </div>
        </div>
    )
}