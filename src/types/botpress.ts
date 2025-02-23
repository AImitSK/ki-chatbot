// src/types/botpress.ts

// Basis-Interface für alle Botpress Events
export interface BotpressBaseEvent {
    type: string;
    id: string;
    timestamp: string;
    botId: string;
    workspaceId: string;
}

// Event wenn eine neue Konversation startet
export interface ConversationStartedEvent extends BotpressBaseEvent {
    type: 'conversation.started';
    payload: {
        conversationId: string;
        userId: string;
        channel: string;
    };
}

// Event wenn eine Nachricht empfangen wird
export interface MessageReceivedEvent extends BotpressBaseEvent {
    type: 'message.received';
    payload: {
        conversationId: string;
        message: {
            id: string;
            type: string;
            text: string;
            // Für spätere Erweiterungen (Bilder, Buttons etc.)
            payload?: any;
        };
        user: {
            id: string;
        };
    };
}

// Event wenn eine Konversation endet
export interface ConversationEndedEvent extends BotpressBaseEvent {
    type: 'conversation.completed';
    payload: {
        conversationId: string;
        metrics: {
            messageCount: number;
            userMessageCount: number;
            botMessageCount: number;
            duration: number; // in Millisekunden
        };
    };
}

// Event für Tokens/AI Usage
export interface TokenUsageEvent extends BotpressBaseEvent {
    type: 'token.usage';
    payload: {
        conversationId: string;
        tokens: number;
        cost: number;
        model: string;
    };
}

// Union Type für alle möglichen Events
export type BotpressEvent =
    | ConversationStartedEvent
    | MessageReceivedEvent
    | ConversationEndedEvent
    | TokenUsageEvent;

// Interface für aggregierte Analytics
export interface BotAnalytics {
    dailyStats: {
        date: string;
        messageCount: number;
        conversationCount: number;
        userCount: number;
        averageConversationDuration: number;
        tokenUsage: number;
        cost: number;
    }[];
    totalStats: {
        totalConversations: number;
        totalMessages: number;
        totalUsers: number;
        totalTokens: number;
        totalCost: number;
    };
}