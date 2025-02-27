// src/app/dashboard/[projectId]/page.tsx
import { sanityClient } from '@/lib/sanity/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import DashboardComponent from '@/components/dashboard/DashboardComponent';

interface ProjectPageProps {
    params: {
        projectId: string;
    };
}

export default async function ProjectDashboardPage({ params }: ProjectPageProps) {
    const session = await getServerSession();

    if (!session?.user?.email) {
        // Redirect wird bereits vom layout.tsx übernommen
        return null;
    }

    try {
        // 1. Hole Benutzer-ID aus E-Mail
        const userId = await sanityClient.fetch(`
      *[_type == "user" && email == $email][0]._id
    `, {
            email: session.user.email
        });

        if (!userId) {
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-red-600">Benutzer nicht gefunden</h1>
                    <p className="mt-2">Ihr Benutzerkonto konnte im System nicht gefunden werden.</p>
                </div>
            );
        }

        // 2. Prüfe, ob der Benutzer Zugriff auf das Projekt hat
        const projectAccess = await sanityClient.fetch(`
      *[_type == "projekte" && _id == $projectId][0] {
        _id,
        titel,
        "hasAccess": $userId in users[]._ref
      }
    `, {
            userId,
            projectId: params.projectId
        });

        if (!projectAccess || !projectAccess.hasAccess) {
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-red-600">Zugriff verweigert</h1>
                    <p className="mt-2">Sie haben keinen Zugriff auf dieses Projekt.</p>
                </div>
            );
        }

        // 3. Prüfe, ob das Projekt eine aktive Umgebung hat
        const projectWithEnvironment = await sanityClient.fetch(`
      *[_type == "projekte" && _id == $projectId][0] {
        _id,
        titel,
        environment-> {
          _id,
          name,
          botId,
          aktiv
        }
      }
    `, {
            projectId: params.projectId
        });

        if (!projectWithEnvironment) {
            return notFound();
        }

        console.log("Projekt mit Umgebung:", JSON.stringify(projectWithEnvironment, null, 2));

        // 4. Dashboard anzeigen - auch wenn keine aktive Umgebung vorhanden ist
        return (
            <div className="bg-gray-50 min-h-screen">
                {!projectWithEnvironment.environment || !projectWithEnvironment.environment.aktiv ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 mb-4 mx-6 mt-6 rounded-md">
                        <h3 className="text-lg font-semibold text-amber-800 mb-1">Hinweis zur Umgebung</h3>
                        <p className="text-amber-700">
                            Für dieses Projekt ist keine aktive Umgebung konfiguriert oder die vorhandene Umgebung ist deaktiviert.
                            Das Dashboard zeigt dennoch Statistiken, die auf den verfügbaren Daten basieren.
                        </p>
                    </div>
                ) : null}
                <DashboardComponent projectId={params.projectId} />
            </div>
        );
    } catch (error) {
        console.error('Error loading project dashboard:', error);

        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Fehler beim Laden</h1>
                <p className="mt-2">Ein unerwarteter Fehler ist aufgetreten beim Laden des Dashboards.</p>
                <p className="mt-2 text-sm text-gray-500">
                    {error instanceof Error ? error.message : 'Unbekannter Fehler'}
                </p>
            </div>
        );
    }
}