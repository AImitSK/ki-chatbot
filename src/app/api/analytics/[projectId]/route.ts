// src/app/api/analytics/[projectId]/route.ts
import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/analytics/aggregator';
import { getServerSession } from 'next-auth';
import { sanityClient } from '@/lib/sanity/client';

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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30', 10);

        if (isNaN(days) || days < 1 || days > 365) {
            return NextResponse.json(
                { error: 'Invalid days parameter' },
                { status: 400 }
            );
        }

        // Get analytics data
        const analytics = await getAnalytics(params.projectId, days);

        return NextResponse.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Analytics API error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch analytics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}