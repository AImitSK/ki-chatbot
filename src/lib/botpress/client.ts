// src/lib/botpress/client.ts - Nur Dashboard
import { sanityClient } from '@/lib/sanity/client'

interface BotpressConfig {
    botId: string
    token: string
    workspaceId: string
}

interface BotpressStats {
    totalStats: {
        totalMessages: number
        totalUsers: number
        totalConversations: number
    }
    dailyStats: Array<{
        date: string
        messageCount: number
        userCount: number
    }>
}

function generateMockDailyStats(days: number = 30) {
    const stats = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
            date: date.toISOString(),
            messageCount: Math.floor(Math.random() * 100) + 20,
            userCount: Math.floor(Math.random() * 20) + 5
        }
    }).reverse()

    const totals = stats.reduce((acc, day) => ({
        totalMessages: acc.totalMessages + day.messageCount,
        totalUsers: acc.totalUsers + Math.ceil(day.userCount / 3),
        totalConversations: acc.totalConversations + Math.ceil(day.messageCount / 4)
    }), {
        totalMessages: 0,
        totalUsers: 0,
        totalConversations: 0
    })

    return {
        dailyStats: stats,
        totalStats: totals
    }
}

async function fetchBotpressAPI(config: BotpressConfig) {
    const url = `https://api.botpress.cloud/sdk/analytics/conversations?botId=${config.botId}`

    console.log(`Fetching Botpress API: ${url}`)

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.token}`,
            'x-workspace-id': config.workspaceId
        }
    })

    if (!response.ok) {
        console.log('Error Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            text: await response.text()
        })
        return null
    }

    return response.json()
}

export async function getBotpressStats(config: BotpressConfig, days: number = 30): Promise<BotpressStats> {
    try {
        const stats = await fetchBotpressAPI(config)

        if (stats) {
            const mockData = generateMockDailyStats(days)
            return {
                totalStats: {
                    totalMessages: stats.totalMessages || mockData.totalStats.totalMessages,
                    totalUsers: stats.totalUsers || mockData.totalStats.totalUsers,
                    totalConversations: stats.totalSessions || mockData.totalStats.totalConversations,
                },
                dailyStats: stats.dailyStats || mockData.dailyStats
            }
        }
    } catch (error) {
        console.error('Error in getBotpressStats:', error)
    }

    const mockData = generateMockDailyStats(days)
    return {
        totalStats: mockData.totalStats,
        dailyStats: mockData.dailyStats
    }
}