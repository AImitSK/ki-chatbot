// lib/security/activityLogger.ts
import { writeClient } from '@/lib/sanity/client'

interface ActivityLogData {
    userId: string;
    userEmail?: string;
    activityType: string;
    details?: string;
}

export async function logActivity({
                                      userId,
                                      userEmail,
                                      activityType,
                                      details
                                  }: ActivityLogData) {
    try {
        const activity = {
            _type: 'activityLog',
            userId: userId || 'anonymous',
            userEmail,
            activityType,
            details,
            timestamp: new Date().toISOString()
        }

        await writeClient.create(activity)
        console.log('✅ Aktivität geloggt:', activityType)
    } catch (error) {
        console.error('Fehler beim Logging der Aktivität:', error)
        // Fehler beim Logging sollte die Hauptfunktionalität nicht blockieren
    }
}