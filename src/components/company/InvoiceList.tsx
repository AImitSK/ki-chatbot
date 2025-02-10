// src/components/company/InvoiceList.tsx
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import useSWR from 'swr'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { fetcher } from '@/lib/swr/fetcher'
import { useState, useMemo } from 'react'

interface Invoice {
    _id: string
    rechnungsnummer: number
    rechnungsdatum: string
    betrag: number
    rechnungsPDF?: {
        asset: {
            url?: string
        }
    }
}

export function InvoiceList() {
    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const { data: invoices, error, isLoading } = useSWR<Invoice[]>(
        '/api/company/invoices',
        fetcher
    )

    // Filter invoices by selected year
    const filteredInvoices = useMemo(() => {
        if (!invoices) return []
        return invoices.filter(invoice => {
            const invoiceYear = new Date(invoice.rechnungsdatum).getFullYear()
            return invoiceYear === selectedYear
        })
    }, [invoices, selectedYear])

    // Get unique years from invoices for the filter
    const availableYears = useMemo(() => {
        if (!invoices) return [currentYear]
        const years = new Set(invoices.map(invoice =>
            new Date(invoice.rechnungsdatum).getFullYear()
        ))
        return [...years].sort((a, b) => b - a) // Sort descending
    }, [invoices, currentYear])

    const handlePdfOpen = (url?: string) => {
        if (url) {
            window.open(url, '_blank')
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
                <p className="mt-2 text-sm text-zinc-500">Lädt Rechnungen...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Fehler beim Laden der Rechnungen</p>
                <p className="text-sm mt-2">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Select
                    name="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </Select>
            </div>

            {!filteredInvoices.length ? (
                <div className="p-8 text-center text-zinc-500">
                    Keine Rechnungen für das Jahr {selectedYear}
                </div>
            ) : (
                <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
                    <TableHead>
                        <TableRow>
                            <TableHeader>Rechnungsnummer</TableHeader>
                            <TableHeader>Datum</TableHeader>
                            <TableHeader className="text-right">Betrag</TableHeader>
                            <TableHeader className="text-right">PDF</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvoices.map((invoice) => (
                            <TableRow key={invoice._id}>
                                <TableCell>{invoice.rechnungsnummer}</TableCell>
                                <TableCell className="text-zinc-500">
                                    {format(new Date(invoice.rechnungsdatum), 'PP', { locale: de })}
                                </TableCell>
                                <TableCell className="text-right">
                                    {invoice.betrag.toFixed(2)}€
                                </TableCell>
                                <TableCell className="text-right">
                                    {invoice.rechnungsPDF?.asset?.url ? (
                                        <a
                                            href={invoice.rechnungsPDF.asset.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-zinc-600 hover:text-zinc-900"
                                            title="PDF öffnen"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handlePdfOpen(invoice.rechnungsPDF?.asset?.url)
                                            }}
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <path d="M14 2v6h6"/>
                                                <path d="M12 18v-6"/>
                                                <path d="m9 15 3 3 3-3"/>
                                            </svg>
                                        </a>
                                    ) : (
                                        <span className="text-zinc-400">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}