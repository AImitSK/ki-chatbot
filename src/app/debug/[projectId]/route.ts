// src/app/api/stats/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';
import { getBotpressStats } from '@/lib/botpress/client';

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        console.log('Fetching project data for ID:', params.projectId);

        // Aktualisierte Sanity-Abfrage um das Projekt mit seiner Environment-Konfiguration zu finden
        const project = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0]{
                _id,
                titel,
                aiSpendLimit,
                "environment": *[_type == "environment" && references(^._id) && aktiv == true][0]{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId: params.projectId });

        console.log('Sanity project data:', project ? 'Found' : 'Not Found');

        if (!project) {
            return NextResponse.json({
                error: 'Project not found',
                debug: { projectId: params.projectId }
            }, { status: 404 });
        }

        if (!project.environment) {
            return NextResponse.json({
                error: 'No active environment configuration found for project',
                debug: {
                    projectId: params.projectId,
                    hasEnvironment: false
                }
            }, { status: 404 });
        }

        console.log('Fetching Botpress stats with config:', {
            botId: project.environment.botId,
            workspaceId: project.environment.workspaceId,
            hasToken: !!project.environment.token
        });

        const stats = await getBotpressStats({
            botId: project.environment.botId,
            token: project.environment.token,
            workspaceId: project.environment.workspaceId
        });

        return NextResponse.json({
            success: true,
            data: {
                aiSpendLimit: project.aiSpendLimit,
                stats: stats
            }
        });
    } catch (error) {
        console.error('Error in stats route:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json({
            error: 'Failed to fetch statistics',
            details: errorMessage,
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