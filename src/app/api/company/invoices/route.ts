// src/app/api/company/invoices/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeClient } from '@/lib/sanity/client'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            console.log('No session found')
            return new NextResponse('Unauthorized', { status: 401 })
        }

        console.log('Session debug:', {
            userId: session.user.id,
            role: session.user.role
        })

        // Query based on role with expanded PDF URL
        const query = session.user.role === 'admin'
            ? `*[_type == "rechnungen"] | order(rechnungsdatum desc) {
                _id,
                rechnungsnummer,
                rechnungsdatum,
                betrag,
                "rechnungsPDF": {
                    "asset": {
                        "url": rechnungsPDF.asset->url
                    }
                }
            }`
            : `*[_type == "rechnungen" && projekt._ref in *[_type == "projekte" && $userId in users[]._ref]._id] | order(rechnungsdatum desc) {
                _id,
                rechnungsnummer,
                rechnungsdatum,
                betrag,
                "rechnungsPDF": {
                    "asset": {
                        "url": rechnungsPDF.asset->url
                    }
                }
            }`

        console.log('Using query:', query)

        const invoices = await writeClient.fetch(query, {
            userId: session.user.id
        })

        console.log('Found invoices:', invoices?.length || 0)
        console.log('Sample invoice PDF:', invoices?.[0]?.rechnungsPDF)

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Error in invoices route:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500 }
        )
    }
}