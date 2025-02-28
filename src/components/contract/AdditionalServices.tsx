// src/components/contract/AdditionalServices.tsx
'use client';

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Text, Strong } from '@/components/ui/text'
import { Subheading } from '@/components/ui/heading'
import { useEffect, useState } from 'react'

interface AdditionalServicesProps {
    contractData: any
}

export default function AdditionalServices({ contractData }: AdditionalServicesProps) {
    // Client-Side State für die Zusatzleistungen
    const [zusatzleistungen, setZusatzleistungen] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Aktualisiere Zusatzleistungen nur auf der Client-Seite
    useEffect(() => {
        if (contractData?.zusatzleistungen && Array.isArray(contractData.zusatzleistungen)) {
            setZusatzleistungen(contractData.zusatzleistungen);
        } else {
            setZusatzleistungen([]);
        }
        setIsClient(true);
    }, [contractData]);

    return (
        <Card>
            <div className="p-4">
                <Subheading>Zusatzleistungen</Subheading>
                <Text className="mt-1 mb-4">Zusätzlich gebuchte Leistungen zu Ihrem Vertrag</Text>

                {/* Render nur auf der Client-Seite, nachdem Hydration abgeschlossen ist */}
                {isClient && (
                    <>
                        {zusatzleistungen.length === 0 ? (
                            <Text>
                                Aktuell sind keine Zusatzleistungen gebucht. Bei Bedarf kontaktieren Sie bitte unser Support-Team.
                            </Text>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Tabellen-Header */}
                                <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800 rounded-t-md border-b border-gray-200 dark:border-gray-700">
                                    <div className="p-3 font-medium text-gray-700 dark:text-gray-300">Leistung</div>
                                    <div className="p-3 font-medium text-gray-700 dark:text-gray-300">Kategorie</div>
                                    <div className="p-3 font-medium text-gray-700 dark:text-gray-300">Typ</div>
                                    <div className="p-3 font-medium text-gray-700 dark:text-gray-300 text-right">Preis</div>
                                </div>

                                {/* Tabellen-Zeilen */}
                                {zusatzleistungen.map((service, index) => (
                                    <div key={service._id || index} className="grid grid-cols-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="p-3">
                                            <Strong>{service.leistung || 'Nicht angegeben'}</Strong>
                                            {service.beschreibung && (
                                                <div className="text-xs text-gray-500 mt-1">{service.beschreibung}</div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <Badge color={getBadgeColorForCategory(service.kategorie || 'other')}>
                                                {getKategorieLabel(service.kategorie || 'other')}
                                            </Badge>
                                        </div>
                                        <div className="p-3">
                                            {service.einmalig ? 'Einmalig' : 'Wiederkehrend'}
                                        </div>
                                        <div className="p-3 text-right">
                                            {typeof service.preis === 'number' ? `${service.preis.toFixed(2)}€` : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Zeige Ladeanzeige, bis Client-Rendering aktiviert ist */}
                {!isClient && (
                    <div className="py-4 text-center">
                        <Text>Lade Zusatzleistungen...</Text>
                    </div>
                )}

                <div className="mt-6">
                    <Subheading level={3}>Hinweis</Subheading>
                    <Text className="mt-2">
                        Die angegebenen Preise verstehen sich zzgl. MwSt. Änderungen der Zusatzleistungen können über Ihren Account Manager vorgenommen werden.
                    </Text>
                </div>
            </div>
        </Card>
    )
}

function getKategorieLabel(kategorie: string): string {
    switch (kategorie) {
        case 'training':
            return 'Training';
        case 'support':
            return 'Support';
        case 'development':
            return 'Entwicklung';
        case 'other':
        default:
            return 'Sonstiges';
    }
}

function getBadgeColorForCategory(kategorie: string): "blue" | "green" | "amber" | "zinc" {
    switch (kategorie) {
        case 'training':
            return 'blue';
        case 'support':
            return 'green';
        case 'development':
            return 'amber';
        case 'other':
        default:
            return 'zinc';
    }
}