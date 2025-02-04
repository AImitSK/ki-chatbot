// src/sanity/components/InvoiceList.tsx
import React, { useCallback, useEffect, useState } from 'react'
import { sanityClient } from '@/lib/sanity/client' // Statt useClient()
import { Box, Card, Stack, Text, Button, Flex } from '@sanity/ui'
import { ChevronRightIcon } from '@sanity/icons'

interface Invoice {
    _id: string
    rechnungsnummer: number
    rechnungsdatum: string
    betrag: number
    bezahlt: boolean
    rechnungsPDF?: {
        asset: {
            _ref: string
            _type: 'reference'
            url?: string
        }
    }
}

interface InvoiceListProps {
    documentId: string
}

export default function InvoiceList({ documentId }: InvoiceListProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchInvoices = useCallback(async () => {
        if (!documentId) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const result = await sanityClient.fetch<Invoice[]>(`
                *[_type == "rechnungen" && projekt._ref == $documentId] | order(rechnungsdatum desc) {
                    _id,
                    rechnungsnummer,
                    rechnungsdatum,
                    betrag,
                    bezahlt,
                    "rechnungsPDF": {
                        "asset": rechnungsPDF.asset->{
                            _ref,
                            _type,
                            "url": url
                        }
                    }
                }
            `, { documentId }) // Korrektur: Sanity Query mit documentId

            setInvoices(result)
        } catch (err) {
            console.error('Error fetching invoices:', err)
            setError('Fehler beim Laden der Rechnungen')
        } finally {
            setIsLoading(false)
        }
    }, [documentId])

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    if (isLoading) {
        return <Box padding={4}>Lädt Rechnungen...</Box>
    }

    if (error) {
        return (
            <Card padding={4} tone="critical">
                <Text>{error}</Text>
            </Card>
        )
    }

    if (!invoices.length) {
        return <Box padding={4}>Keine Rechnungen vorhanden</Box>
    }

    return (
        <Stack space={4} padding={4}>
            {invoices.map((invoice) => (
                <Card
                    key={invoice._id}
                    padding={4}
                    radius={2}
                    shadow={1}
                    tone={invoice.bezahlt ? 'positive' : 'default'}
                >
                    <Flex justify="space-between" align="center">
                        <Stack space={3}>
                            <Text size={2} weight="semibold">
                                Rechnung {invoice.rechnungsnummer}
                            </Text>
                            <Text size={1}>
                                Datum: {new Date(invoice.rechnungsdatum).toLocaleDateString('de-DE')}
                            </Text>
                            <Text size={1}>
                                Betrag: {invoice.betrag.toFixed(2)}€
                            </Text>
                            <Text size={1}>
                                Status: {invoice.bezahlt ? 'Bezahlt' : 'Offen'}
                            </Text>
                        </Stack>
                        {invoice.rechnungsPDF?.asset?.url && (
                            <Button
                                fontSize={1}
                                icon={ChevronRightIcon}
                                mode="ghost"
                                onClick={() => window.open(invoice.rechnungsPDF?.asset?.url, '_blank')}
                                text="PDF öffnen"
                            />
                        )}
                    </Flex>
                </Card>
            ))}
        </Stack>
    )
}
