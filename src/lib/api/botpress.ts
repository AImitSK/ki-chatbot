// src/lib/api/botpress.ts
interface BotpressConfig {
    botId: string;
    token: string;
    workspaceId: string;
}

interface BotpressStats {
    messages: {
        total: number;
        bot: number;
        user: number;
    };
    sessions: number;
    users: {
        total: number;
        new: number;
        returning: number;
    };
    aiSpend: number;  // Hinzugefügt
}

export async function getBotpressStats(config: BotpressConfig): Promise<BotpressStats> {
    const baseUrl = 'https://app.botpress.cloud/workspaces';
    const headers = {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log('Fetching Botpress stats with config:', config);  // Debugging hinzugefügt

        // Parallele Anfragen für verschiedene Statistiken
        const [messagesResponse, sessionsResponse, usersResponse, costResponse] = await Promise.all([
            fetch(`${baseUrl}/${config.workspaceId}/bots/${config.botId}/stats/messages`, { headers }),
            fetch(`${baseUrl}/${config.workspaceId}/bots/${config.botId}/stats/sessions`, { headers }),
            fetch(`${baseUrl}/${config.workspaceId}/bots/${config.botId}/stats/users`, { headers }),
            fetch(`${baseUrl}/${config.workspaceId}/bots/${config.botId}/stats/costs`, { headers })  // Neue Anfrage für AI-Kosten
        ]);

        // Verarbeite die Antworten
        const messages = await messagesResponse.json();
        const sessions = await sessionsResponse.json();
        const users = await usersResponse.json();
        const costs = await costResponse.json();

        console.log('Messages Response:', messages);  // Debugging hinzugefügt
        console.log('Sessions Response:', sessions);  // Debugging hinzugefügt
        console.log('Users Response:', users);        // Debugging hinzugefügt
        console.log('Costs Response:', costs);        // Debugging hinzugefügt

        return {
            messages: {
                total: messages.total || 0,
                bot: messages.bot || 0,
                user: messages.user || 0
            },
            sessions: sessions.total || 0,
            users: {
                total: users.total || 0,
                new: users.new || 0,
                returning: users.returning || 0
            },
            aiSpend: costs.total || 0  // Hinzugefügt
        };
    } catch (error) {
        console.error('Error fetching Botpress stats:', error);  // Debugging hinzugefügt
        throw new Error('Failed to fetch Botpress statistics');
    }
}

export async function getMessageHistory(config: BotpressConfig, limit: number = 100) {
    const baseUrl = 'https://app.botpress.cloud/workspaces';
    const headers = {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log('Fetching message history with config:', config, 'Limit:', limit);  // Debugging hinzugefügt

        const response = await fetch(
            `${baseUrl}/${config.workspaceId}/bots/${config.botId}/conversations?limit=${limit}`,
            { headers }
        );

        const data = await response.json();

        console.log('Message history:', data);  // Debugging hinzugefügt
        return data.messages || [];
    } catch (error) {
        console.error('Error fetching message history:', error);  // Debugging hinzugefügt
        throw new Error('Failed to fetch message history');
    }
}