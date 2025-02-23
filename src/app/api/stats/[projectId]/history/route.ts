// src/app/api/stats/[projectId]/history/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';
import { getMessageHistory } from '@/lib/botpress/client';
import type { BotpressHistoryDay } from '@/lib/botpress/client';

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        // Prüfe ob das Projekt existiert
        const project = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0] {
                _id,
                titel
            }
        `, { projectId: params.projectId });

        if (!project) {
            return NextResponse.json({
                error: 'Project not found',
                debug: { projectId: params.projectId }
            }, { status: 404 });
        }

        // Hole aktives Environment (wie in der stats route)
        const environment = await sanityClient.fetch(`
            *[_type == "environment" && aktiv == true][0] {
                botId,
                token,
                workspaceId
            }
        `);

        if (!environment) {
            return NextResponse.json({
                error: 'No active environment found',
                debug: {
                    projectId: params.projectId,
                    hasEnvironment: false
                }
            }, { status: 404 });
        }

        const history = await getMessageHistory({
            botId: environment.botId,
            token: environment.token,
            workspaceId: environment.workspaceId
        });

        const formattedHistory = history.map((day: BotpressHistoryDay) => ({
            date: day.date,
            messages: day.total_messages || 0,
            sessions: day.total_sessions || 0
        }));

        return NextResponse.json({
            success: true,
            data: formattedHistory
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({
            error: 'Failed to fetch history',
            details: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                timestamp: new Date().toISOString(),
                errorType: error instanceof Error ? error.constructor.name : typeof error,
                projectId: params.projectId
            }
        }, {
            status: 500
        });
    }
}