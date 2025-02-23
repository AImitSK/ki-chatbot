// src/app/dashboard/page.tsx
import { sanityClient } from '@/lib/sanity/client';
import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
    // Initialisiere eine Variable für Debug-Output
    const debugOutput = [];

    try {
        debugOutput.push('Starting dashboard page load...');

        // 1. Session Check
        const session = await getServerSession();
        debugOutput.push(`Session found: ${!!session}`);

        if (!session) {
            debugOutput.push('No session - showing login message');
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Nicht angemeldet</h1>
                    <p className="mt-2">Bitte melden Sie sich an, um fortzufahren.</p>
                    <pre className="mt-4 p-4 bg-gray-100 rounded">
                        {debugOutput.join('\n')}
                    </pre>
                </div>
            );
        }

        // 2. Projekt-Abfrage
        debugOutput.push('Fetching project from Sanity...');
        const project = await sanityClient.fetch(`
            *[_type == "projekte"][0] {
                _id,
                titel,
                "environment": *[_type == "environment" && aktiv == true][0]
            }
        `);
        debugOutput.push(`Project found: ${!!project}`);

        if (project?._id) {
            const redirectUrl = `/dashboard/${project._id}`;
            debugOutput.push(`Redirecting to: ${redirectUrl}`);

            // Zeige Debug-Info für 1 Sekunde vor dem Redirect
            return (
                <div className="p-6">
                    <p>Weiterleitung...</p>
                    <pre className="mt-4 p-4 bg-gray-100 rounded">
                        {debugOutput.join('\n')}
                    </pre>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `setTimeout(() => { window.location.href = "${redirectUrl}"; }, 1000);`
                        }}
                    />
                </div>
            );
        }

        // 3. Kein Projekt gefunden
        debugOutput.push('No project found - showing error message');
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Kein Projekt gefunden</h1>
                <p className="mt-2">Es wurde kein aktives Projekt gefunden.</p>
                <pre className="mt-4 p-4 bg-gray-100 rounded">
                    {debugOutput.join('\n')}
                </pre>
                {project && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <h2 className="font-semibold">Projekt-Details:</h2>
                        <pre className="mt-2 text-sm">
                            {JSON.stringify(project, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        debugOutput.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Error in dashboard page:', error);

        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Fehler beim Laden</h1>
                <p className="mt-2">Ein Fehler ist aufgetreten beim Laden der Seite.</p>
                <pre className="mt-4 p-4 bg-gray-100 rounded">
                    {debugOutput.join('\n')}
                </pre>
            </div>
        );
    }
}