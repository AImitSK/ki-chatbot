// src/app/dashboard/conversations/page.tsx
import { Suspense } from 'react'
import { ConversationsList } from '@/components/conversations/ConversationsList'
import { sanityClient } from '@/lib/sanity/client'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getProjectId(email: string) {
    console.log("Suche Projekt für Email:", email) // Debug

    const projectData = await sanityClient.fetch(`
        *[_type == "projekte" && references(*[_type == "user" && email == $email]._id)][0]{
            _id,
            environment->{
                botId,
                token,
                workspaceId
            }
        }
    `, { email })

    console.log("Gefundene Projektdaten:", {
        id: projectData?._id,
        hasEnvironment: !!projectData?.environment,
        environmentData: projectData?.environment // Zeigt die Botpress-Zugangsdaten
    })

    return projectData?._id
}

export default async function ConversationsPage() {
    const session = await getServerSession()
    console.log("Session in Conversations:", session) // Debug

    if (!session?.user?.email) {
        console.log("Keine Session gefunden - Redirect to login") // Debug
        redirect('/auth/login')
    }

    const projectId = await getProjectId(session.user.email)
    console.log("Ermittelte Project ID:", projectId) // Debug

    if (!projectId) {
        console.log("Kein Projekt gefunden für User:", session.user.email) // Debug
        return (
            <div className="min-h-screen p-6">
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Kein Projekt gefunden</p>
                    <pre className="mt-4 p-4 bg-gray-100 rounded text-left">
                        Debug Info:
                        Email: {session.user.email}
                    </pre>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Konversationen</h1>
                <p className="text-sm text-gray-500">
                    Debug Info: Project ID {projectId}
                </p>
            </div>

            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-sm text-gray-500">Lädt Konversationen...</div>
                </div>
            }>
                <ConversationsList projectId={projectId} />
            </Suspense>
        </div>
    )
}