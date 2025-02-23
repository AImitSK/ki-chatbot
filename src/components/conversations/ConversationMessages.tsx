// src/components/conversations/ConversationMessages.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface ConversationMessagesProps {
    conversationId: string;
}

export function ConversationMessages({ conversationId }: ConversationMessagesProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const response = await fetch(`/api/conversations/${conversationId}/messages`);
                if (!response.ok) throw new Error('Failed to fetch messages');
                const data = await response.json();
                setMessages(data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMessages();
    }, [conversationId]);

    if (isLoading) {
        return <div className="text-center py-8">Lade Nachrichten...</div>;
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender === 'user'
                                ? 'bg-[#0693e3] text-white'
                                : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                            {format(new Date(message.timestamp), 'PPp', { locale: de })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}