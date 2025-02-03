// app/api/sanity-client-test/route.ts

import { client } from '@/lib/sanity/client'

export async function GET() {
    try {
        // Beispielabfrage: Zählt alle Dokumente im Dataset
        const documentCount = await client.fetch(`count(*)`);

        console.log('Sanity Abfrage erfolgreich! Anzahl der Dokumente:', documentCount);

        return new Response(
            `Sanity query passed! Anzahl der Dokumente: ${documentCount}`,
            { status: 200 }
        );
    } catch (error) {
        console.error('Fehler bei der Sanity-Abfrage:', error);

        return new Response(
            `Sanity-Client Fehler: ${(error as Error).message}`,
            { status: 500 }
        );
    }
}