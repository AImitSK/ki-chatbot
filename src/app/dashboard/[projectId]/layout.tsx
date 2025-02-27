// src/app/dashboard/[projectId]/layout.tsx
import { getServerSession } from 'next-auth';
import { sanityClient } from '@/lib/sanity/client';
import { Toaster } from 'react-hot-toast';

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: {
        projectId: string;
    };
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
    const session = await getServerSession();

    if (!session?.user?.email) {
        // Wird bereits vom parent layout behandelt
        return children;
    }

    // Nur die Projektdaten für den Titel abrufen
    const projectData = await sanityClient.fetch(`
    *[_type == "projekte" && _id == $projectId][0] {
      titel
    }
  `, {
        projectId: params.projectId
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow">
                {children}
            </main>

            <Toaster position="top-right" />

            <footer className="py-3 px-6 bg-white border-t border-gray-200 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Chatbot Analytics Dashboard
            </footer>
        </div>
    );
}