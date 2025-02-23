// src/app/api/conversations/[id]/messages/route.ts
import { NextResponse } from 'next/server'
import { getBotpressClient } from '@/lib/botpress/conversations'
import { getServerSession } from 'next-auth'
import { sanityClient } from '@/lib/sanity/client'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Session Check
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get project for the user
        const userProject = await sanityClient.fetch(`
            *[_type == "projekte" && references(*[_type == "user" && email == $email]._id)][0]{
                _id,
                environment->{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, {
            email: session.user.email
        })

        if (!userProject) {
            return NextResponse.json({ error: 'No project found' }, { status: 404 })
        }

        // Get Botpress client
        const client = await getBotpressClient(userProject._id)

        // Fetch messages
        const messages = await client.listMessages(params.id)

        return NextResponse.json({ messages })

    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        )
    }
}