// src/lib/analytics/aggregator.ts
import { sanityClient } from '@/lib/sanity/client';
import type { BotAnalytics } from '@/types/botpress';
import { startOfDay, subDays, format } from 'date-fns';

interface RawEventData {
    _id: string;
    eventType: string;
    timestamp: string;
    payload: {
        messageCount?: number;
        userMessageCount?: number;
        botMessageCount?: number;
        duration?: number;
        tokens?: number;
        cost?: number;
        user?: {
            id: string;
        };
        conversationId?: string;
    };
}

interface DailyStats {
    date: string;
    messageCount: number;
    conversationCount: number;
    userCount: number;
    averageConversationDuration: number;
    tokenUsage: number;
    cost: number;
}

export async function getAnalytics(projectId: string, days: number = 30): Promise<BotAnalytics> {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, days);

    // Hole alle relevanten Events für den Zeitraum
    const events = await sanityClient.fetch<RawEventData[]>(`
    *[
      _type == "botEvent" && 
      projekt._ref == $projectId &&
      dateTime(timestamp) >= dateTime($startDate) &&
      dateTime(timestamp) <= dateTime($endDate)
    ] {
      _id,
      eventType,
      timestamp,
      payload
    }
  `, {
        projectId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    });

    // Initialisiere Tagesstatistiken
    const dailyStatsMap = new Map<string, DailyStats>();
    const dateRange = Array.from({ length: days + 1 }, (_, i) =>
        format(subDays(endDate, i), 'yyyy-MM-dd')
    );

    // Initialisiere jeden Tag mit Standardwerten
    dateRange.forEach(date => {
        dailyStatsMap.set(date, {
            date,
            messageCount: 0,
            conversationCount: 0,
            userCount: 0,
            averageConversationDuration: 0,
            tokenUsage: 0,
            cost: 0
        });
    });

    // Map für aktive Nutzer pro Tag
    const dailyUsers: Record<string, Set<string>> = {};

    // Verarbeite Events
    events.forEach(event => {
        const date = format(new Date(event.timestamp), 'yyyy-MM-dd');
        const stats = dailyStatsMap.get(date);

        if (!stats) return;

        // Initialisiere Set für Nutzer wenn nötig
        if (!dailyUsers[date]) {
            dailyUsers[date] = new Set();
        }

        switch (event.eventType) {
            case 'conversation.completed': {
                stats.conversationCount += 1;
                if (event.payload.duration) {
                    const currentTotal = stats.averageConversationDuration * (stats.conversationCount - 1);
                    stats.averageConversationDuration = (currentTotal + event.payload.duration) / stats.conversationCount;
                }
                if (event.payload.messageCount) {
                    stats.messageCount += event.payload.messageCount;
                }
                break;
            }

            case 'token.usage': {
                if (event.payload.tokens) {
                    stats.tokenUsage += event.payload.tokens;
                }
                if (event.payload.cost) {
                    stats.cost += event.payload.cost;
                }
                break;
            }

            case 'message.received': {
                if (event.payload.user?.id) {
                    dailyUsers[date].add(event.payload.user.id);
                }
                break;
            }
        }

        dailyStatsMap.set(date, stats);
    });

    // Aktualisiere User Counts
    Object.entries(dailyUsers).forEach(([date, users]) => {
        const stats = dailyStatsMap.get(date);
        if (stats) {
            stats.userCount = users.size;
            dailyStatsMap.set(date, stats);
        }
    });

    // Berechne Gesamtstatistiken
    const totalStats = {
        totalConversations: 0,
        totalMessages: 0,
        totalUsers: 0,
        totalTokens: 0,
        totalCost: 0
    };

    dailyStatsMap.forEach(stats => {
        totalStats.totalConversations += stats.conversationCount;
        totalStats.totalMessages += stats.messageCount;
        totalStats.totalTokens += stats.tokenUsage;
        totalStats.totalCost += stats.cost;
    });

    // Berechne Gesamtzahl eindeutiger Nutzer
    const allUsers = new Set<string>();
    Object.values(dailyUsers).forEach(userSet => {
        userSet.forEach(userId => allUsers.add(userId));
    });
    totalStats.totalUsers = allUsers.size;

    // Sortiere Tagesstatistiken chronologisch
    const dailyStats = Array.from(dailyStatsMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        dailyStats,
        totalStats
    };
}