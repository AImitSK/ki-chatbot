// src/components/contract/AdditionalServices.tsx
'use client';

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Text, Strong } from '@/components/ui/text'
import { Subheading } from '@/components/ui/heading'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/table'
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
                    <div>
                        {zusatzleistungen.length === 0 ? (
                            <Text>
                                Aktuell sind keine Zusatzleistungen gebucht. Bei Bedarf kontaktieren Sie bitte unser Support-Team.
                            </Text>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Leistung</TableHead>
                                            <TableHead>Kategorie</TableHead>
                                            <TableHead>Typ</TableHead>
                                            <TableHead className="text-right">Preis</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {zusatzleistungen.map((service: any) => (
                                            <TableRow key={service._id}>
                                                <TableCell>
                                                    <Strong>{service.leistung}</Strong>
                                                    {service.beschreibung && (
                                                        <div className="text-xs text-gray-500 mt-1">{service.beschreibung}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge color={getBadgeColorForCategory(service.kategorie || 'other')}>
                                                        {getKategorieLabel(service.kategorie || 'other')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {service.einmalig ? 'Einmalig' : 'Wiederkehrend'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {typeof service.preis === 'number' ? `${service.preis.toFixed(2)}€` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
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