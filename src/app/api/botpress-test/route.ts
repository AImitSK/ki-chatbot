// src/app/api/botpress-test/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';

async function testEndpoint(url: string, config: any) {
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.token}`,
            'x-bot-id': config.botId,
            'x-workspace-id': config.workspaceId
        }
    };

    console.log(`Testing endpoint: ${url}`);
    try {
        const response = await fetch(url, options);
        const status = response.status;

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = await response.text();
        }

        return {
            success: response.ok,
            status,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function GET() {
    try {
        // Hole Environment-Konfiguration aus Sanity
        const environment = await sanityClient.fetch(`
            *[_type == "environment" && aktiv == true][0] {
                botId,
                token,
                workspaceId
            }
        `);

        if (!environment) {
            return NextResponse.json({ error: 'No active environment found' }, { status: 404 });
        }

        // Teste jeden Endpunkt einzeln
        const results = {
            config: {
                botId: environment.botId,
                workspaceId: environment.workspaceId,
                hasToken: !!environment.token
            },
            endpoints: {} as any
        };

        // Test v1 endpoints
        results.endpoints['messages'] = await testEndpoint(
            `https://api.botpress.cloud/v1/admin/bots/${environment.botId}/messages`,
            environment
        );

        results.endpoints['conversations'] = await testEndpoint(
            `https://api.botpress.cloud/v1/admin/bots/${environment.botId}/conversations`,
            environment
        );

        results.endpoints['bot_info'] = await testEndpoint(
            `https://api.botpress.cloud/v1/admin/bots/${environment.botId}`,
            environment
        );

        // Test v2 endpoints
        results.endpoints['v2_bot'] = await testEndpoint(
            `https://api.botpress.cloud/v2/admin/bots/${environment.botId}`,
            environment
        );

        results.endpoints['v2_workspace'] = await testEndpoint(
            `https://api.botpress.cloud/v2/admin/workspaces/${environment.workspaceId}`,
            environment
        );

        results.endpoints['v2_conversations'] = await testEndpoint(
            `https://api.botpress.cloud/v2/admin/bots/${environment.botId}/conversations`,
            environment
        );

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error in test route:', error);
        return NextResponse.json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}