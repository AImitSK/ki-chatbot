// src/components/contract/ContractOverview.tsx
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Text, Strong } from '@/components/ui/text'
import {
    DescriptionList,
    DescriptionTerm,
    DescriptionDetails
} from '@/components/ui/description-list'
import { Subheading } from '@/components/ui/heading'
import { formatDate } from '@/lib/utils'

interface ContractOverviewProps {
    data: any
}

export default function ContractOverview({ data }: ContractOverviewProps) {
    if (!data) {
        return (
            <Card>
                <div className="p-4">
                    <Subheading>Vertragsdetails</Subheading>
                    <Text className="mt-2">Keine Vertragsdaten gefunden</Text>
                </div>
            </Card>
        )
    }

    const isActive = !data.vertragsende || new Date(data.vertragsende) > new Date()
    const vertragsBeginn = formatDate(data.vertragsbeginn)
    const vertragsEnde = data.vertragsende ? formatDate(data.vertragsende) : 'Unbefristet'

    return (
        <Card>
            <div className="p-4">
                <Subheading>Vertragsdetails</Subheading>
                <Text className="mt-1 mb-4">Informationen zu Ihrem Vertragsmodell</Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <DescriptionList>
                            <DescriptionTerm>Vertragsmodell</DescriptionTerm>
                            <DescriptionDetails>
                                <Strong>{data.vertragsmodell?.name || 'Nicht angegeben'}</Strong>
                            </DescriptionDetails>

                            <DescriptionTerm>Status</DescriptionTerm>
                            <DescriptionDetails>
                                <Badge color={isActive ? "green" : "red"}>
                                    {isActive ? 'Aktiv' : 'Inaktiv'}
                                </Badge>
                            </DescriptionDetails>

                            <DescriptionTerm>Monatlicher Preis</DescriptionTerm>
                            <DescriptionDetails>
                                {data.vertragsmodell?.preis ?
                                    <Strong>{data.vertragsmodell.preis.toFixed(2)}€</Strong> :
                                    'Nicht angegeben'}
                                {data.vertragsmodell?.zahlungsintervall === 'yearly' ? ' (jährliche Zahlung)' : ''}
                            </DescriptionDetails>
                        </DescriptionList>
                    </div>

                    <div>
                        <DescriptionList>
                            <DescriptionTerm>Vertragsbeginn</DescriptionTerm>
                            <DescriptionDetails>{vertragsBeginn}</DescriptionDetails>

                            <DescriptionTerm>Vertragsende</DescriptionTerm>
                            <DescriptionDetails>{vertragsEnde}</DescriptionDetails>

                            <DescriptionTerm>Support-Level</DescriptionTerm>
                            <DescriptionDetails>
                                {getSupportLevelLabel(data.vertragsmodell?.supportlevel)}
                            </DescriptionDetails>
                        </DescriptionList>
                    </div>
                </div>

                {data.vertragsmodell?.beschreibung && (
                    <div className="mt-6">
                        <Subheading level={3}>Beschreibung</Subheading>
                        <Text className="mt-2">
                            {data.vertragsmodell.beschreibung}
                        </Text>
                    </div>
                )}

                <div className="mt-6">
                    <Subheading level={3}>Inkludiertes AI Budget</Subheading>
                    <Text className="mt-2">
                        {data.vertragsmodell?.freeAiSpend ?
                            <Strong>{data.vertragsmodell.freeAiSpend.toFixed(2)}€ pro Monat</Strong> :
                            'Nicht angegeben'}
                    </Text>
                </div>

                {data.vertragsmodell?.features && data.vertragsmodell.features.length > 0 && (
                    <div className="mt-6">
                        <Subheading level={3}>Features</Subheading>
                        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {data.vertragsmodell.features.map((feature: any, index: number) => (
                                <li key={index} className="flex items-center text-sm">
                                    {feature.included ? (
                                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    {feature.feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    )
}

function getSupportLevelLabel(level: string): string {
    switch (level) {
        case 'email':
            return 'Email Support';
        case 'email_phone':
            return 'Email & Telefon Support';
        case 'premium':
            return 'Premium Support';
        default:
            return 'Standard Support';
    }
}