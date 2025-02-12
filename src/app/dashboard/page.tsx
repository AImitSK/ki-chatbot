// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { sanityClient } from '@/lib/sanity/client';

export default async function DashboardPage() {
    console.log('Executing query to fetch first available project...');
    const project = await sanityClient.fetch(`
    *[_type == "projekte"][0] {
      _id,
      titel
    }
  `);
    console.log('Fetched project:', JSON.stringify(project, null, 2));

    if (project) {
        console.log(`Redirecting to /dashboard/${project._id}`);
        // Achtung: Dieser Aufruf löst absichtlich einen NEXT_REDIRECT-Fehler aus,
        // der von Next.js abgefangen und als Redirect verarbeitet wird.
        redirect(`/dashboard/${project._id}`);
    }

    // Falls kein Projekt gefunden wird, wird der Fallback gerendert:
    console.log('No project found – rendering fallback UI.');
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Kein Projekt gefunden</h1>
            <p className="mt-2">Es wurde kein Projekt für Sie gefunden.</p>
        </div>
    );
}
