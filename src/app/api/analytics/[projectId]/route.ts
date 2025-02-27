// src/app/api/analytics/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sanityClient } from '@/lib/sanity/client';
import { getBotpressClient } from '@/lib/botpress/conversations';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface BotEvent {
    timestamp: string;
    eventType: string;
    payload: {
        user?: {
            id?: string;
        };
        message?: {
            direction?: string;
        };
        tokens?: number;
        cost?: number;
    };
}

interface DailyStatsItem {
    date: string;
    messageCount: number;
    botMessageCount: number;
    userMessageCount: number;
    userCount: number;
    newUserCount: number;
    conversationCount: number;
    llmCallCount: number;
    llmErrorCount: number;
    tokenUsage: number;
    cost: number;
}

interface DailyStatsMap {
    [key: string]: DailyStatsItem;
}

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

        // Botpress Conversations für den angegebenen Zeitraum abrufen
        // Da bei client.listConversations die Typendefinition keine startDate/endDate akzeptiert,
        // erstellen wir ein erweitertes Objekt und casten es zum erwarteten Typ
        const conversationsParams: any = {
            limit: 1000,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };

        const conversationsData = await client.listConversations(conversationsParams);

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
        const dailyStats: DailyStatsItem[] = [];
        const dailyData: DailyStatsMap = {};
        const userMap = new Set<string>();
        const newUserMap = new Set<string>();

        // Bot-Events verarbeiten
        (botEvents as BotEvent[]).forEach(event => {
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
                        const userId = event.payload.user.id;
                        if (!userMap.has(userId)) {
                            userMap.add(userId);
                            newUserMap.add(userId);
                            dailyData[date].newUserCount++;
                        }

                        // Zähle Benutzer pro Tag
                        const dailyUsers = new Set<string>();
                        (botEvents as BotEvent[]).forEach(e => {
                            if (e.eventType === 'message.received' &&
                                e.payload.user?.id &&
                                format(new Date(e.timestamp), 'yyyy-MM-dd') === date) {
                                dailyUsers.add(e.payload.user.id);
                            }
                        });
                        dailyData[date].userCount = dailyUsers.size;
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

        // Sortiere die täglichen Daten nach Datum
        dailyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Zusammenfassung der Daten berechnen
        const totalStats = {
            totalUsers: userMap.size,
            newUsers: newUserMap.size,
            totalMessages: dailyStats.reduce((sum, day) => sum + (day.messageCount || 0), 0),
            botMessages: dailyStats.reduce((sum, day) => sum + (day.botMessageCount || 0), 0),
            userMessages: dailyStats.reduce((sum, day) => sum + (day.userMessageCount || 0), 0),
            totalConversations: dailyStats.reduce((sum, day) => sum + (day.conversationCount || 0), 0),
            totalTokens: dailyStats.reduce((sum, day) => sum + (day.tokenUsage || 0), 0),
            totalCost: dailyStats.reduce((sum, day) => sum + (day.cost || 0), 0),
            totalLlmCalls: dailyStats.reduce((sum, day) => sum + (day.llmCallCount || 0), 0),
            totalLlmErrors: dailyStats.reduce((sum, day) => sum + (day.llmErrorCount || 0), 0)
        };

        // Antwort mit allen Daten zurückgeben
        return NextResponse.json({
            data: {
                dailyStats,
                totalStats,
                aiSpendLimit: projectData.aiSpendLimit || 0
            }
        });

    } catch (error) {
        console.error('Error in analytics API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}