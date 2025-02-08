// src/app/api/user/activity/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Hole die letzten 50 Aktivitäten des Users
        const activities = await client.fetch(`
      *[_type == "activityLog" && user._ref == $userId] | order(timestamp desc)[0...50] {
        _id,
        activityType,
        timestamp,
        ipAddress,
        userAgent,
        details
      }
    `, { userId: session.user.id })

        // Debug-Log
        console.log('Gefundene Aktivitäten:', activities.length)

        return NextResponse.json(activities)
    } catch (error) {
        console.error('Error fetching activity log:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}