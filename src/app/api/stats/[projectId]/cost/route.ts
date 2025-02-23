// src/app/api/stats/[projectId]/cost/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        // Hole die letzten 30 Tage Token-Usage Events
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const events = await sanityClient.fetch(`
            *[
                _type == "botEvent" && 
                projekt._ref == $projectId &&
                eventType == "token.usage" &&
                timestamp >= $startDate
            ] | order(timestamp asc) {
                timestamp,
                "date": timestamp,
                "tokens": payload.tokens,
                "cost": payload.cost
            }
        `, {
            projectId: params.projectId,
            startDate: thirtyDaysAgo.toISOString()
        });

        return NextResponse.json({
            success: true,
            data: events
        });

    } catch (error) {
        console.error('Error fetching cost data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch cost data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}