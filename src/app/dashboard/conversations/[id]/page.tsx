// src/app/dashboard/conversations/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface ConversationDetailProps {
    params: { id: string }
}

export default function ConversationDetail({ params }: ConversationDetailProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchMessages() {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/conversations/${params.id}/messages`)
                if (!response.ok) throw new Error('Failed to fetch messages')
                const data = await response.json()
                setMessages(data.messages)
            } catch (error) {
                console.error('Error fetching messages:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMessages()
    }, [params.id])

    if (isLoading) {
        return (
            <div className="min-h-screen p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Konversation</h1>
                        <p className="text-sm text-gray-500">ID: {params.id}</p>
                    </div>
                    <Link
                        href="/dashboard/conversations"
                        className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                    >
                        Zurück zur Übersicht
                    </Link>
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className="rounded bg-gray-200 h-10 w-64"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Konversation</h1>
                    <p className="text-sm text-gray-500">ID: {params.id}</p>
                </div>
                <Link
                    href="/dashboard/conversations"
                    className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                >
                    Zurück zur Übersicht
                </Link>
            </div>

            <div className="space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                message.sender === 'user'
                                    ? 'bg-[#0693e3] text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                                {format(new Date(message.timestamp), 'dd. MMM yyyy HH:mm', { locale: de })}
                            </div>
                        </div>
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        Keine Nachrichten in dieser Konversation
                    </div>
                )}
            </div>
        </div>
    )
}