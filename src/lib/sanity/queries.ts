// src/lib/sanity/queries.ts
import { client } from './client'
import { User } from '@/types'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

export async function getUserData(): Promise<User> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error('Benutzer nicht angemeldet')
    }

    const user = await client.fetch<User>(`*[_type == "user" && _id == $userId][0]`, {
        userId: session.user.id,
    })

    if (!user) {
        throw new Error('Benutzer nicht gefunden')
    }

    return user
}