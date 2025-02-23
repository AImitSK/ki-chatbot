// src/app/api/stats/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { getBotpressStats } from '@/lib/botpress/client';
import { sanityClient } from '@/lib/sanity/client';

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        // Hole Projekt-Daten
        const project = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0] {
                _id,
                titel,
                "environment": *[_type == "environment" && aktiv == true][0] {
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId: params.projectId });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        if (!project.environment) {
            return NextResponse.json(
                { error: 'No active environment found' },
                { status: 404 }
            );
        }

        // Get stats (will return mock data if API fails)
        try {
            const stats = await getBotpressStats(project.environment);
            return NextResponse.json({ data: stats });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Return mock data on error
            return NextResponse.json({
                data: {
                    totalStats: {
                        totalMessages: 100,
                        totalUsers: 30,
                        totalConversations: 25,
                    },
                    dailyStats: [{
                        date: new Date().toISOString(),
                        messageCount: 50,
                        userCount: 10
                    }]
                }
            });
        }
    } catch (error) {
        console.error('Error in stats route:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}