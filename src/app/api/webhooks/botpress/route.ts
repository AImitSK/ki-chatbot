// src/app/api/webhooks/botpress/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';
import type { BotpressEvent, BotpressBaseEvent } from '@/types/botpress';
import { createHash, timingSafeEqual } from 'crypto';

interface WebhookError extends Error {
    code: string;
    statusCode: number;
}

// Type Guard für BotpressEvent
function isBotpressEvent(event: unknown): event is BotpressEvent {
    if (!event || typeof event !== 'object') return false;

    const eventObj = event as Partial<BotpressBaseEvent>;
    const baseEventProperties: (keyof BotpressBaseEvent)[] = [
        'type',
        'id',
        'timestamp',
        'botId',
        'workspaceId'
    ];

    // Überprüfe, ob alle Basiseigenschaften vorhanden sind
    const hasBaseProperties = baseEventProperties.every(prop =>
        typeof eventObj[prop] !== 'undefined'
    );

    if (!hasBaseProperties) return false;

    // Überprüfe den Event-Typ
    const validEventTypes = [
        'conversation.started',
        'message.received',
        'conversation.completed',
        'token.usage'
    ] as const;

    return validEventTypes.includes(eventObj.type as typeof validEventTypes[number]);
}

// Hilfsfunktion zur Webhook-Signatur-Validierung
function validateSignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const computedSignature = createHash('sha256')
        .update(payload)
        .update(secret)
        .digest('hex');

    return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature)
    );
}

// Hilfsfunktion zum Speichern von Event-Daten in Sanity
async function storeEventData(event: BotpressEvent): Promise<void> {
    const projectId = await getBotProjectId(event.botId);

    const doc = {
        _type: 'botEvent',
        eventId: event.id,
        eventType: event.type,
        timestamp: event.timestamp,
        botId: event.botId,
        payload: event.payload,
        projekt: {
            _type: 'reference',
            _ref: projectId
        }
    };

    await sanityClient.create(doc);
}

// Hilfsfunktion zum Abrufen der Projekt-ID basierend auf der Bot-ID
async function getBotProjectId(botId: string): Promise<string> {
    const result = await sanityClient.fetch<{ projectId: string | null }>(
        `*[_type == "environment" && botId == $botId][0] {
      "projectId": *[_type == "projekte" && references(^._id)][0]._id
    }`,
        { botId }
    );

    if (!result?.projectId) {
        const error = new Error(`No project found for botId: ${botId}`) as WebhookError;
        error.code = 'PROJECT_NOT_FOUND';
        error.statusCode = 404;
        throw error;
    }

    return result.projectId;
}

// Event-Handler für verschiedene Event-Typen
const eventHandlers = {
    'conversation.started': async (event: BotpressEvent) => {
        await storeEventData(event);
        // Zusätzliche Logik für Konversations-Start
    },

    'message.received': async (event: BotpressEvent) => {
        await storeEventData(event);
        // Zusätzliche Logik für empfangene Nachrichten
    },

    'conversation.completed': async (event: BotpressEvent) => {
        await storeEventData(event);
        // Zusätzliche Logik für beendete Konversationen
    },

    'token.usage': async (event: BotpressEvent) => {
        await storeEventData(event);
        // Zusätzliche Logik für Token-Nutzung
    }
} as const;

// Hauptfunktion zum Verarbeiten von Webhook Events
export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('X-Botpress-Signature');

        if (!validateSignature(
            payload,
            signature,
            process.env.BOTPRESS_WEBHOOK_SECRET || ''
        )) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const rawEvent = JSON.parse(payload);

        if (!isBotpressEvent(rawEvent)) {
            return NextResponse.json(
                { error: 'Invalid event format' },
                { status: 400 }
            );
        }

        const handler = eventHandlers[rawEvent.type];
        await handler(rawEvent);

        return NextResponse.json({ success: true });
    } catch (error) {
        const statusCode = (error as WebhookError).statusCode || 500;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error('Webhook processing error:', error);

        return NextResponse.json(
            {
                error: 'Webhook processing failed',
                details: errorMessage
            },
            { status: statusCode }
        );
    }
}