// src/app/api/data/company/route.ts
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

export async function PUT(req: Request) {
    try {
        const body = await req.json()

        const updatedCompany = await client.patch(body._id)
            .set(body)
            .commit() // Commit gibt die aktualisierten Daten zurück

        return NextResponse.json(updatedCompany) // Aktualisierte Daten zurückgeben
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Unternehmensdaten:', error)
        return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
    }
}
