// src/components/company/InvoiceList.tsx
'use client'

import { Card } from '@/components/ui/Card' // Korrigierte Case-Sensitivity
import useSWR from 'swr'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

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
    const { data: invoices, error, isLoading } = useSWR<Invoice[]>('/api/company/invoices')

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Fehler beim Laden der Rechnungen
            </div>
        )
    }

    if (!invoices?.length) {
        return (
            <div className="p-8 text-center text-zinc-500">
                Keine Rechnungen vorhanden
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {invoices.map((invoice) => (
                <InvoiceCard key={invoice._id} invoice={invoice} />
            ))}
        </div>
    )
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="font-medium">Rechnung {invoice.rechnungsnummer}</h3>
                    <p className="text-sm text-zinc-500">
                        {format(new Date(invoice.rechnungsdatum), 'PP', { locale: de })}
                    </p>
                    <p className="text-sm font-medium">
                        {invoice.betrag.toFixed(2)}€
                    </p>
                </div>
                {invoice.rechnungsPDF?.asset?.url && (
                    <button
                        onClick={() => window.open(invoice.rechnungsPDF?.asset?.url, '_blank')}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                        aria-label="PDF öffnen"
                    >
                        <svg
                            className="h-5 w-5 text-zinc-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <path d="M14 2v6h6"/>
                            <path d="M16 13H8"/>
                            <path d="M16 17H8"/>
                            <path d="M10 9H8"/>
                        </svg>
                    </button>
                )}
            </div>
        </Card>
    )
}