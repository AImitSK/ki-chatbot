// src/components/contract/ContractDocuments.tsx
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Text, Strong } from '@/components/ui/text'
import { Subheading } from '@/components/ui/heading'
import Link from 'next/link'

interface ContractDocumentsProps {
    contractData: any
}

export default function ContractDocuments({ contractData }: ContractDocumentsProps) {
    // Beispiel-Dokumente, die in einer echten Implementierung aus den Vertragsdaten kommen würden
    const documents = [
        {
            id: '1',
            name: 'Vertragsdokument.pdf',
            url: '#',
            type: 'Vertrag',
            date: '01.01.2023'
        },
        {
            id: '2',
            name: 'AGB.pdf',
            url: '#',
            type: 'AGB',
            date: '01.01.2023'
        },
        {
            id: '3',
            name: 'Datenschutzerklärung.pdf',
            url: '#',
            type: 'Datenschutz',
            date: '01.01.2023'
        }
    ]

    return (
        <Card>
            <div className="p-4">
                <Subheading>Vertragsdokumente</Subheading>
                <Text className="mt-1 mb-4">Wichtige Dokumente zu Ihrem Vertrag</Text>

                {documents.length === 0 ? (
                    <Text>
                        Keine Dokumente vorhanden.
                    </Text>
                ) : (
                    <div className="space-y-4">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md border-zinc-950/10 dark:border-white/10">
                                <div className="flex items-center space-x-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    <div>
                                        <Strong>{doc.name}</Strong>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {doc.type} • {doc.date}
                                        </div>
                                    </div>
                                </div>

                                <Link href={doc.url} target="_blank" passHref>
                                    <Button plain>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            data-slot="icon"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Download
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <Subheading level={3}>Hinweis</Subheading>
                    <Text className="mt-2">
                        Alle Dokumente werden automatisch aktualisiert, wenn sich Ihre Vertragsbedingungen ändern.
                        Ältere Versionen von Dokumenten sind über die Versionsverwaltung einsehbar.
                    </Text>
                </div>
            </div>
        </Card>
    )
}