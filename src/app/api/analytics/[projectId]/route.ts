// src/app/api/analytics/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sanityClient } from '@/lib/sanity/client';
import { getBotpressClient } from '@/lib/botpress/conversations';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';

async function checkProjectAccess(userId: string, projectId: string): Promise<boolean> {
    const result = await sanityClient.fetch(`
    *[_type == "projekte" && _id == $projectId][0] {
      "hasAccess": $userId in users[]._ref
    }
    `, {
        userId,
        projectId
    });

    return result?.hasAccess || false;
}

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        // Auth Check
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // URL-Parameter abrufen
        const { searchParams } = new URL(request.url);

        // Standard: Letzter Monat
        let startDate = subMonths(new Date(), 1);
        startDate = startOfMonth(startDate);

        let endDate = subMonths(new Date(), 1);
        endDate = endOfMonth(endDate);

        // Überschreiben mit Anfrage-Parametern, falls vorhanden
        if (searchParams.has('startDate')) {
            startDate = parseISO(searchParams.get('startDate') || '');
        }

        if (searchParams.has('endDate')) {
            endDate = parseISO(searchParams.get('endDate') || '');
        }

        // Get user ID from email
        const user = await sanityClient.fetch(`
      *[_type == "user" && email == $email][0]._id
    `, {
            email: session.user.email
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check project access
        const hasAccess = await checkProjectAccess(user, params.projectId);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Projekt-Daten und Botpress-Client abrufen
        const projectData = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0]{
                _id,
                aiSpendLimit,
                environment->{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId: params.projectId });

        if (!projectData?.environment) {
            return NextResponse.json(
                { error: 'No environment found for project' },
                { status: 404 }
            );
        }

        const client = await getBotpressClient(params.projectId);

        // Aus Botpress-API die Gesprächsdaten holen
        const conversationsData = await client.listConversations({
            limit: 1000, // Höheres Limit für umfassendere Daten
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        // Botpress Stats für Messager und User abrufen
        const botpressStats = await fetch(`/api/stats/${params.projectId}?days=30`);
        const statsData = await botpressStats.json();

        // Bot Events aus Sanity holen (für Token-Nutzung und Kosten)
        const botEvents = await sanityClient.fetch(`
            *[
                _type == "botEvent" && 
                projekt._ref == $projectId &&
                dateTime(timestamp) >= dateTime($startDate) &&
                dateTime(timestamp) <= dateTime($endDate)
            ] | order(timestamp asc) {
                timestamp,
                eventType,
                payload
            }
        `, {
            projectId: params.projectId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        // Daten aggregieren und aufbereiten
        const dailyStats = [];
        const dailyData = {};
        const userMap = new Set();
        const newUserMap = new Set();

        // Bot-Events verarbeiten
        botEvents.forEach(event => {
            const date = format(new Date(event.timestamp), 'yyyy-MM-dd');

            if (!dailyData[date]) {
                dailyData[date] = {
                    date,
                    messageCount: 0,
                    botMessageCount: 0,
                    userMessageCount: 0,
                    userCount: 0,
                    newUserCount: 0,
                    conversationCount: 0,
                    llmCallCount: 0,
                    llmErrorCount: 0,
                    tokenUsage: 0,
                    cost: 0
                };
            }

            // Verschiedene Event-Typen verarbeiten
            switch (event.eventType) {
                case 'message.received':
                    if (event.payload.user?.id) {
                        if (!userMap.has(event.payload.user.id)) {
                            userMap.add(event.payload.user.id);
                            newUserMap.add(event.payload.user.id);
                            dailyData[date].newUserCount++;
                        }
                        dailyData[date].userCount = new Set([...userMap].filter(id =>
                            botEvents.some(e =>
                                e.eventType === 'message.received' &&
                                e.payload.user?.id === id &&
                                format(new Date(e.timestamp), 'yyyy-MM-dd') === date
                            )
                        )).size;
                    }

                    if (event.payload.message?.direction === 'incoming') {
                        dailyData[date].userMessageCount++;
                    } else {
                        dailyData[date].botMessageCount++;
                    }

                    dailyData[date].messageCount++;
                    break;

                case 'conversation.started':
                    dailyData[date].conversationCount++;
                    break;

                case 'token.usage':
                    dailyData[date].tokenUsage += event.payload.tokens || 0;
                    dailyData[date].cost += event.payload.cost || 0;
                    dailyData[date].llmCallCount++;
                    break;

                case 'llm.error':
                    dailyData[date].llmErrorCount++;
                    break;
            }
        });

        // Tägliche Statistiken in Array umwandeln
        Object.values(dailyData).forEach(day => {
            dailyStats.push(day);
        });

        // Zusammenfassung der Daten berechnen
        const totalStats = {
            totalUsers: userMap.size,
            newUsers: newUserMap.size,
            totalMessages: dailyStats.reduce((sum, day: any) => sum + (day.messageCount || 0), 0),
            botMessages: dailyStats.reduce((sum, day: any) => sum + (day.botMessageCount || 0), 0),
            userMessages: dailyStats.reduce((sum, day: any) => sum + (day.userMessageCount || 0), 0),
            totalConversations: dailyStats.reduce((sum, day: any) => sum + (day.conversationCount || 0), 0),
            totalTokens: dailyStats.reduce((sum, day: any) => sum + (day.tokenUsage || 0), 0),
            totalCost: dailyStats.reduce((sum, day: any) => sum + (day.cost || 0), 0),
            totalLlmCalls: dailyStats.reduce((sum, day: any) => sum + (day.llmCallCount || 0), 0),
            totalLlmErrors: dailyStats.