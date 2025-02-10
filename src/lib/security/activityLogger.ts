// src/lib/security/activityLogger.ts
import { writeClient } from '@/lib/sanity/client'

export interface LogActivityParams {
    userId: string
    activityType: string
    details?: string
    ipAddress?: string
    userAgent?: string
}

export async function logActivity({
                                      userId,
                                      activityType,
                                      details,
                                      ipAddress = 'unknown',
                                      userAgent = 'unknown'
                                  }: LogActivityParams) {
    try {
        await writeClient.create({
            _type: 'activityLog',
            user: {
                _type: 'reference',
                _ref: userId
            },
            activityType,
            timestamp: new Date().toISOString(),
            ipAddress,
            userAgent,
            details
        })
    } catch (error) {
        console.error('Error logging activity:', error)
        throw error
    }
}