// src/lib/security/activityLogger.ts
import { headers } from 'next/headers'
import { writeClient } from '@/lib/sanity/client'  // Änderung hier: writeClient statt client

export interface LogActivityParams {
    userId: string
    activityType: string
    details?: string
}

export async function logActivity({
                                      userId,
                                      activityType,
                                      details
                                  }: LogActivityParams) {
    try {
        const headersList = headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        await writeClient.create({  // Änderung hier: writeClient statt client
            _type: 'activityLog',
            user: {
                _type: 'reference',
                _ref: userId
            },
            activityType,
            timestamp: new Date().toISOString(),
            ipAddress: ip,
            userAgent,
            details
        })
    } catch (error) {
        console.error('Error logging activity:', error)
        throw error // Weitergeben des Fehlers für besseres Debugging
    }
}