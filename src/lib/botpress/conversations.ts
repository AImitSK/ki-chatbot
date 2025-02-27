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
        nextToken?: string
        total?: number
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
            // Korrekter Endpunkt laut Botpress Feedback
            const url = `https://api.botpress.cloud/v1/chat/conversations`;

            // Pagination-Token für Offset-basierte Paginierung
            let paginationUrl = url;
            if (offset > 0 && offset > limit) {
                // In einer echten Implementierung müsstest du hier das nextToken
                // aus der vorherigen Abfrage verwenden
                paginationUrl = `${url}?nextToken=some_token`;
            }

            console.log('Requesting URL:', paginationUrl);

            const response = await fetch(paginationUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`,
                    'x-bot-id': this.config.botId,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Error details:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: paginationUrl,
                    headers: Object.fromEntries(response.headers),
                    error: await response.text()
                });
                throw new Error(`API returned ${response.status}`);
            }

            const data: BotpressResponse = await response.json();
            console.log('API Response data:', data);

            return {
                conversations: data.conversations || [],
                totalCount: data.meta?.total || data.conversations?.length || 0,
                nextToken: data.meta?.nextToken
            };
        } catch (error) {
            console.error('Complete error details:', error);
            const mockData = generateMockConversations(limit + offset);
            return {
                conversations: mockData.slice(offset, offset + limit),
                totalCount: mockData.length,
                nextToken: null
            };
        }
    }

    async listMessages(conversationId: string) {
        try {
            console.log('Fetching messages for conversation:', conversationId);

            // Korrekter Endpunkt für Messages
            const url = `https://api.botpress.cloud/v1/chat/messages?conversationId=${conversationId}`;

            console.log('Requesting URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`,
                    'x-bot-id': this.config.botId,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    url: response.url
                });
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data: BotpressResponse = await response.json();
            console.log('Messages response data:', data);

            return (data.messages || []).map((msg: BotpressMessage) => ({
                id: msg.id,
                content: msg.payload?.text || msg.text || '',
                sender: msg.direction === 'incoming' ? 'user' : 'bot',
                timestamp: msg.createdAt
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            return generateMockMessages(conversationId);
        }
    }
}

function generateMockConversations(limit: number = 20): Conversation[] {
    return Array.from({ length: limit }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - i);
        return {
            id: `conv_${Math.random().toString(36).substr(2, 9)}`,
            lastMessage: {
                content: `Das ist eine Test-Nachricht ${i + 1}`
            },
            createdAt: new Date(date.setHours(date.getHours() - Math.random() * 24)).toISOString(),
            updatedAt: date.toISOString(),
            participantName: `Besucher ${i + 1}`
        };
    });
}

function generateMockMessages(conversationId: string): Message[] {
    const messageCount = Math.floor(Math.random() * 10) + 5;
    const messages: Message[] = [];
    let date = new Date();

    for (let i = 0; i < messageCount; i++) {
        date = new Date(date.getTime() - Math.random() * 1000 * 60 * 10);
        messages.push({
            id: `msg_${Math.random().toString(36).substr(2, 9)}`,
            content: `Test Nachricht ${i + 1} in Konversation ${conversationId}`,
            sender: i % 2 === 0 ? 'user' : 'bot',
            timestamp: date.toISOString()
        });
    }

    return messages.reverse();
}

export async function getBotpressClient(projectId: string): Promise<BotpressClient> {
    const envQuery = `*[_type == "projekte" && _id == $projectId][0]{
        environment->{
            botId,
            token,
            workspaceId
        }
    }`;

    const project = await sanityClient.fetch(envQuery, { projectId });

    if (!project?.environment) {
        throw new Error('No environment found for project');
    }

    return new BotpressClient(project.environment);
}