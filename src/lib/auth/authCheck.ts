// src/lib/auth/authCheck.ts
import { getServerSession } from 'next-auth'
import { sanityClient } from '@/lib/sanity/client'

export async function checkProjectAccess(projectId: string) {
    const session = await getServerSession()

    if (!session?.user?.email) {
        return false
    }

    // Prüfe, ob der Benutzer Zugriff auf das Projekt hat
    const hasAccess = await sanityClient.fetch(`
        *[_type == "projekte" && _id == $projectId && $userEmail in users[].email][0]
    `, {
        projectId,
        userEmail: session.user.email
    })

    return !!hasAccess
}

// Helper für API-Routes
export async function checkAuth() {
    const session = await getServerSession()

    if (!session) {
        return new Response('Unauthorized', { status: 401 })
    }

    return null
}