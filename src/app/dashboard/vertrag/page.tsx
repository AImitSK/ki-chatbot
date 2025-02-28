// src/app/dashboard/vertrag/page.tsx
import { Heading } from '@/components/ui/heading'
import { getContractData } from '@/lib/sanity/queries'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Text } from '@/components/ui/text'
import { Card } from '@/components/ui/Card'
import { sanityClient } from '@/lib/sanity/client'

// Standardimporte für Komponenten
import ContractOverview from '@/components/contract/ContractOverview'
import AdditionalServices from '@/components/contract/AdditionalServices'
import ContractDocuments from '@/components/contract/ContractDocuments'
import ContractUpgrade from '@/components/contract/ContractUpgrade'

export default async function VertragPage() {
    // Session prüfen
    const session = await getServerSession()

    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    try {
        // 1. Benutzer-ID aus der E-Mail abrufen, wie in anderen Komponenten
        const userId = await sanityClient.fetch(`
            *[_type == "user" && email == $email][0]._id
        `, {
            email: session.user.email
        })

        if (!userId) {
            return (
                <div className="space-y-8">
                    <Heading>Vertragsinformationen</Heading>
                    <Card>
                        <div className="p-4">
                            <Text className="text-red-600">
                                Benutzer konnte nicht gefunden werden. Bitte kontaktieren Sie den Support.
                            </Text>
                        </div>
                    </Card>
                </div>
            )
        }

        // 2. Mit der gefundenen userId die Vertragsdaten abrufen
        const contractData = await getContractData(userId)

        // 3. Wenn keine Vertragsdaten gefunden wurden, Hinweis anzeigen
        if (!contractData) {
            return (
                <div className="space-y-8">
                    <Heading>Vertragsinformationen</Heading>
                    <Card>
                        <div className="p-4">
                            <Text className="text-amber-600">
                                Keine Vertragsinformationen für diesen Benutzer verfügbar. Bitte wenden Sie sich an Ihren Ansprechpartner.
                            </Text>
                        </div>
                    </Card>
                </div>
            )
        }

        // 4. Vertragsinformationen anzeigen
        return (
            <div className="space-y-8">
                <Heading>Vertragsinformationen</Heading>

                <ContractOverview data={contractData} />

                <AdditionalServices contractData={contractData} />

                <ContractDocuments contractData={contractData} />

                <ContractUpgrade contractData={contractData} />
            </div>
        )
    } catch (error) {
        console.error('Fehler beim Laden der Vertragsdaten:', error);
        return (
            <div className="space-y-8">
                <Heading>Vertragsinformationen</Heading>
                <Card>
                    <div className="p-4">
                        <Text className="text-red-600">
                            Beim Laden der Vertragsdaten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.
                        </Text>
                    </div>
                </Card>
            </div>
        )
    }
}