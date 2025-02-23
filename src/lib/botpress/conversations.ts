// src/lib/botpress/conversations.ts
import { sanityClient } from '@/lib/sanity/client'

interface BotpressConfig {
    botId: string
    token: string
    workspaceId: string
}

export interface Message {
    id: string
    content: string
    sender: 'user' | 'bot'
    timestamp: string
}

export interface Conversation {
    id: string
    lastMessage: {
        content: string
    } | null
    createdAt: string
    updatedAt: string
    participantName: string
}

// Botpress API Response Types
interface BotpressMessage {
    id: string
    conversationId: string
    direction: 'incoming' | 'outgoing'
    payload?: {
        text?: string
    }
    text?: string
    createdAt: string
}

interface BotpressConversation {
    id: string
    lastMessage?: {
        text?: string
        content?: string
    }
    createdAt: string
    updatedAt?: string
    participantName?: string
}

interface BotpressResponse {
    conversations?: BotpressConversation[]
    messages?: BotpressMessage[]
    meta?: {
        total: number
    }
    total?: number
}

export class BotpressClient {
    private config: BotpressConfig

    constructor(config: BotpressConfig) {
        this.config = config
    }

    async listConversations({ limit = 20, offset = 0 }) {
        try {
            // 1. Erst alle Bots für den Workspace holen
            const botsResponse = await fetch(
                `https://api.botpress.cloud/v1/admin/bots`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.token}`,
                        'x-workspace-id': this.config.workspaceId
                    }
                }
            );

            console.log('Bots Response:', await botsResponse.json());

            // Wenn wir die Bot-UUID haben, dann die Konversationen holen
            const url = new URL('https://api.botpress.cloud/v1/chat/conversations');
            url.searchParams.append('botId', this.config.botId);
            url.searchParams.append('limit', limit.toString());
            url.searchParams.append('offset', offset.toString());

            console.log('Requesting URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`,
                    'x-workspace-id': this.config.workspaceId
                }
            });

            if (!response.ok) {
                console.error('Error details:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: url.toString(),
                    headers: Object.fromEntries(response.headers),
                    error: await response.text()
                });
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);

            return {
                conversations: data.conversations || [],
                totalCount: data.total || 0
            };
        } catch (error) {
            console.error('Complete error details:', error);
            const mockData = generateMockConversations(limit + offset);
            return {
                conversations: mockData.slice(offset, offset + limit),
                totalCount: mockData.length
            };
        }
    
    }

    async listMessages(conversationId: string) {
        try {
            console.log('Fetching messages for conversation:', conversationId)

            const response = await fetch(
                `https://api.botpress.cloud/v1/chat/messages?` +
                `conversationId=${conversationId}&` +
                `botId=${this.config.botId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.token}`,
                        'Accept': 'application/json',
                        'x-workspace-id': this.config.workspaceId
                    }
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error('API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    url: response.url
                })
                throw new Error(`API returned ${response.status}: ${errorText}`)
            }

            const data: BotpressResponse = await response.json()
            console.log('Messages response data:', data)

            return (data.messages || []).map((msg: BotpressMessage) => ({
                id: msg.id,
                content: msg.payload?.text || msg.text || '',
                sender: msg.direction === 'incoming' ? 'user' : 'bot',
                timestamp: msg.createdAt
            }))
        } catch (error) {
            console.error('Error fetching messages:', error)
            return generateMockMessages(conversationId)
        }
    }
}

function generateMockConversations(limit: number = 20): Conversation[] {
    return Array.from({ length: limit }, (_, i) => {
        const date = new Date()
        date.setHours(date.getHours() - i)
        return {
            id: `conv_${Math.random().toString(36).substr(2, 9)}`,
            lastMessage: {
                content: `Das ist eine Test-Nachricht ${i + 1}`
            },
            createdAt: new Date(date.setHours(date.getHours() - Math.random() * 24)).toISOString(),
            updatedAt: date.toISOString(),
            participantName: `Besucher ${i + 1}`
        }
    })
}

function generateMockMessages(conversationId: string): Message[] {
    const messageCount = Math.floor(Math.random() * 10) + 5
    const messages: Message[] = []
    let date = new Date()

    for (let i = 0; i < messageCount; i++) {
        date = new Date(date.getTime() - Math.random() * 1000 * 60 * 10)
        messages.push({
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            content: `Test Nachricht ${i + 1} in Konversation ${conversationId}`,
            sender: i % 2 === 0 ? 'user' : 'bot',
            timestamp: date.toISOString()
        })
    }

    return messages.reverse()
}

export async function getBotpressClient(projectId: string): Promise<BotpressClient> {
    const envQuery = `*[_type == "projekte" && _id == $projectId][0]{
        environment->{
            botId,
            token,
            workspaceId
        }
    }`

    const project = await sanityClient.fetch(envQuery, { projectId })

    if (!project?.environment) {
        throw new Error('No environment found for project')
    }

    return new BotpressClient(project.environment)
}