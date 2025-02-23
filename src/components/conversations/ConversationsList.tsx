// src/components/conversations/ConversationsList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import type { Conversation } from '@/lib/botpress/conversations'

interface ConversationsListProps {
    projectId: string
}

export function ConversationsList({ projectId }: ConversationsListProps) {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 20

    useEffect(() => {
        async function fetchConversations() {
            try {
                setIsLoading(true)
                const response = await fetch(
                    `/api/conversations?projectId=${projectId}&page=${page}&pageSize=${pageSize}`
                )

                if (!response.ok) throw new Error('Failed to fetch conversations')

                const data = await response.json()
                setConversations(data.conversations)
                setTotalPages(Math.ceil(data.pagination.total / pageSize))
            } catch (error) {
                console.error('Error fetching conversations:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchConversations()
    }, [projectId, page])

    if (isLoading) {
        return (
            <div className="divide-y divide-gray-100">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center gap-4 p-4">
                        <div className="h-5 w-5 bg-gray-200 rounded-full" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-24 ml-auto" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-w-full divide-y divide-gray-100">
            {conversations.map((conversation) => (
                <div
                    key={conversation.id}
                    onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-700 truncate">
                            {conversation.id}
                        </div>
                        <div className="text-sm text-gray-500 truncate mt-1">
                            {conversation.lastMessage?.content || 'Keine Nachricht'}
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-sm text-gray-500">
                        <span>{format(new Date(conversation.updatedAt), 'dd.MM.yyyy', { locale: de })}</span>
                        <span>{format(new Date(conversation.updatedAt), 'HH:mm', { locale: de })}</span>
                    </div>
                </div>
            ))}

            {conversations.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Keine Konversationen vorhanden</p>
                </div>
            )}

            <div className="flex justify-between items-center p-4 border-t">
        <span className="text-sm text-gray-500">
          Seite {page} von {totalPages}
        </span>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:text-gray-400"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Vorherige
                    </button>
                    <button
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:text-gray-400"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages}
                    >
                        Nächste
                    </button>
                </div>
            </div>
        </div>
    )
}