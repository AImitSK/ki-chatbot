// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server'
import { getBotpressClient } from '@/lib/botpress/conversations'
import { getServerSession } from 'next-auth'
import { sanityClient } from '@/lib/sanity/client'

export async function GET(request: Request) {
    try {
        // 1. Session Check
        const session = await getServerSession()
        console.log("API Session:", session) // Debug

        if (!session?.user?.email) {
            console.log("API: Keine Session gefunden") // Debug
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get query parameters
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        console.log("API: Angefragte Project ID:", projectId) // Debug

        if (!projectId) {
            console.log("API: Keine Project ID übergeben") // Debug
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
        }

        // 3. Get project environment data
        const projectData = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0]{
                _id,
                environment->{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId })

        console.log("API: Gefundene Projektdaten:", {
            id: projectData?._id,
            hasEnvironment: !!projectData?.environment,
            environmentData: projectData?.environment // Zeigt die Botpress-Zugangsdaten
        })

        // 4. Get Botpress client
        const client = await getBotpressClient(projectId)
        console.log("API: Botpress Client erstellt") // Debug

        // 5. Fetch conversations
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        console.log("API: Lade Konversationen mit:", { page, pageSize }) // Debug

        const result = await client.listConversations({
            limit: pageSize,
            offset: (page - 1) * pageSize
        })

        console.log("API: Konversationen geladen:", {
            count: result.conversations.length,
            total: result.totalCount
        }) // Debug

        return NextResponse.json({
            conversations: result.conversations,
            pagination: {
                total: result.totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(result.totalCount / pageSize)
            }
        })

    } catch (error) {
        console.error('API Error:', error) // Debug
        return NextResponse.json(
            {
                error: 'Failed to fetch conversations',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}