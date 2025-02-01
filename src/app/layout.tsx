import './globals.css'  // Ändere den Import von tailwind.css zu globals.css
import type { Metadata } from 'next'
import type React from 'react'
import { ApplicationLayout } from './application-layout'
import { getEvents } from '@/app/data'

export const metadata: Metadata = {
    title: {
        template: '%s - Catalyst',
        default: 'Catalyst',
    },
    description: '',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    let events = await getEvents()

    return (
        <html
            lang="en"
            className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
        >
        <body>
        <ApplicationLayout events={events}>{children}</ApplicationLayout>
        </body>
        </html>
    )
}