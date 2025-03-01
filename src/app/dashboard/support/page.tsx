// src/app/dashboard/support/page.tsx
import { Suspense } from 'react'
import { Heading } from '@/components/ui/heading'
import { FAQSection } from '@/components/support/FAQSection'
import { SupportTickets } from '@/components/support/SupportTickets'
import { Documentation } from '@/components/support/Documentation'
import { ContactOptions } from '@/components/support/ContactOptions'
import { getServerSession } from 'next-auth'
import { getContractData, debugUserProjects } from '@/lib/sanity/queries'
import { sanityClient } from '@/lib/sanity/client'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/text'

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
    console.log("User Email:", session?.user?.email || "Nicht vorhanden")

    let contractData = null;
    let userId = null;

    if (session?.user?.email) {
        try {
            // Benutzer-ID aus der E-Mail abrufen (wie in der Vertragsseite)
            userId = await sanityClient.fetch(`
                *[_type == "user" && email == $email][0]._id
            `, {
                email: session.user.email
            })

            console.log("Ermittelte User ID aus Email:", userId || "Nicht gefunden")

            // Debugging: Alle Projekte für den Benutzer anzeigen
            if (userId) {
                await debugUserProjects(userId)

                // Vertragsdaten abrufen mit der gefundenen userId
                contractData = await getContractData(userId)
                console.log("Vertragsdaten geladen:", contractData ? "Erfolgreich" : "Keine Daten gefunden")
            }
        } catch (error) {
            console.error("Fehler beim Laden der Benutzerdaten:", error)
        }
    }

    return (
        <div className="space-y-6">
            <Heading>Support & Hilfe</Heading>

            {!session?.user?.email ? (
                <Card>
                    <div className="p-4">
                        <Text className="text-amber-600">
                            Bitte melden Sie sich an, um alle Support-Funktionen nutzen zu können.
                        </Text>
                    </div>
                </Card>
            ) : !userId ? (
                <Card>
                    <div className="p-4">
                        <Text className="text-amber-600">
                            Benutzer konnte nicht gefunden werden. Bitte kontaktieren Sie den Administrator.
                        </Text>
                    </div>
                </Card>
            ) : null}

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
                    <h2 className="text-xl font-semibold mb-6">Kontakt</h2>
                    <ContactOptions />
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-6">Häufig gestellte Fragen</h2>
                    <FAQSection />
                </div>
            </SimpleTabs>
        </div>
    )
}