// src/components/contract/InvoiceList.tsx
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Text, Strong } from '@/components/ui/text'
import { Subheading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { getInvoices } from '@/lib/sanity/queries'
import { formatDate } from '@/lib/utils'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/table'
import Link from 'next/link'

interface InvoiceListProps {
    projectId?: string
}

export default async function InvoiceList({ projectId }: InvoiceListProps) {
    const invoices = projectId ? await getInvoices(projectId) : []

    return (
        <Card>
            <div className="p-4">
                <Subheading>Rechnungen</Subheading>
                <Text className="mt-1 mb-4">Übersicht Ihrer Rechnungen</Text>

                {!projectId || invoices.length === 0 ? (
                    <Text>
                        Aktuell sind keine Rechnungen verfügbar.
                    </Text>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rechnungsnr.</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead>Betrag</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice: any) => (
                                <TableRow key={invoice._id}>
                                    <TableCell>
                                        <Strong>{invoice.rechnungsnummer}</Strong>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(invoice.rechnungsdatum)}
                                    </TableCell>
                                    <TableCell>
                                        {invoice.betrag.toFixed(2)}€
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={invoice.bezahlt ? "green" : "amber"}>
                                            {invoice.bezahlt ? 'Bezahlt' : 'Offen'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {invoice.rechnungsPDF?.asset?.url ? (
                                            <Link href={invoice.rechnungsPDF.asset.url} target="_blank" passHref>
                                                <Button plain>PDF</Button>
                                            </Link>
                                        ) : (
                                            <Button plain disabled>Nicht verfügbar</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="mt-6">
                    <Subheading level={3}>Zahlungsinformationen</Subheading>
                    <Text className="mt-2">
                        Das Zahlungsziel beträgt 14 Tage nach Rechnungsstellung. Bei Fragen zu Ihrer Rechnung kontaktieren Sie bitte rechnungen@sk-online-marketing.de
                    </Text>
                </div>
            </div>
        </Card>
    )
}