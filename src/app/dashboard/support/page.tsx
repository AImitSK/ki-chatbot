// src/app/dashboard/support/page.tsx
import { Suspense } from 'react'
import { Heading } from '@/components/ui/heading'
import { FAQSection } from '@/components/support/FAQSection'
import { SupportTickets } from '@/components/support/SupportTickets'
import { Documentation } from '@/components/support/Documentation'
import { ContactOptions } from '@/components/support/ContactOptions'
import { getServerSession } from 'next-auth'
import { getContractData, debugUserProjects } from '@/lib/sanity/queries'

// Einfache Tabs-Implementierung, da die Tab-Komponente nicht verfügbar ist
function SimpleTabs({ children }: { children: React.ReactNode }) {
    return <div className="space-y-8">{children}</div>;
}

export default async function SupportPage() {
    // Benutze die korrekte Methode, um die Session abzurufen, ohne authOptions
    const session = await getServerSession()

    // Debug-Ausgabe der Session
    console.log("Session:", session ? "Vorhanden" : "Nicht vorhanden")
    console.log("User:", session?.user ? "Vorhanden" : "Nicht vorhanden")
    console.log("User ID:", session?.user?.id || "Nicht vorhanden")

    // Sicherstellen, dass wir eine gültige User-ID haben
    const userId = session?.user?.id

    // Debugging: Alle Projekte für den Benutzer anzeigen
    if (userId) {
        await debugUserProjects(userId)
    }

    // Vertragsdaten abrufen, nur wenn eine User-ID vorhanden ist
    const contractData = userId ? await getContractData(userId) : null

    return (
        <div className="space-y-6">
            <Heading>Support & Hilfe</Heading>

            <SimpleTabs>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-6">Dokumentation</h2>
                    <Suspense fallback={<div>Lade Dokumentation...</div>}>
                        <Documentation contractData={contractData} />
                    </Suspense>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-6">Support-Tickets</h2>
                    <Suspense fallback={<div>Lade Support-Tickets...</div>}>
                        <SupportTickets />
                    </Suspense>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-6">Häufig gestellte Fragen</h2>
                    <FAQSection />
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-6">Kontakt</h2>
                    <ContactOptions />
                </div>
            </SimpleTabs>
        </div>
    )
}