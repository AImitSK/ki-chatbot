// src/app/api/projects/budget/route.ts
import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity/client';
import { checkAuth, checkProjectAccess } from '@/lib/auth/authCheck';

export async function PUT(request: Request) {
    console.log('--- PUT /api/projects/budget gestartet ---');

    // Auth Check
    const authError = await checkAuth();
    if (authError) {
        console.error('Auth-Fehler:', authError);
        return authError;
    }

    try {
        const body = await request.json();
        console.log('Eingehender Request-Body:', JSON.stringify(body, null, 2));

        const { projectId, newBudget } = body;

        // Validierung
        if (!projectId || typeof newBudget !== 'number' || newBudget < 0) {
            console.error('Validierungsfehler – Ungültige Eingabedaten:', { projectId, newBudget });
            return NextResponse.json(
                { error: 'Ungültige Eingabedaten' },
                { status: 400 }
            );
        }

        // Projekt-Zugriff prüfen
        console.log(`Prüfe Zugriffsberechtigung für Projekt: ${projectId}`);
        const hasAccess = await checkProjectAccess(projectId);
        if (!hasAccess) {
            console.error('Zugriff verweigert für Projekt:', projectId);
            return NextResponse.json(
                { error: 'Keine Berechtigung' },
                { status: 403 }
            );
        }

        // Update in Sanity
        console.log(`Aktualisiere aiSpendLimit für Projekt ${projectId} auf neuen Budgetwert ${newBudget}`);
        const result = await sanityClient
            .patch(projectId)
            .set({ aiSpendLimit: newBudget })
            .commit();

        console.log('Budget erfolgreich aktualisiert:', JSON.stringify(result, null, 2));
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating budget:', error);
        return NextResponse.json(
            { error: 'Fehler beim Aktualisieren des Budgets' },
            { status: 500 }
        );
    }
}
