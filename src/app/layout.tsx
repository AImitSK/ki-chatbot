// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import AuthProvider from '@/components/providers/SessionProvider'
import { ApplicationLayout } from './application-layout'
import { getEvents } from '@/app/data'
import { ToastContainer } from '@/components/ui/toast'

export const metadata: Metadata = {
    title: {
        template: '%s - Catalyst',
        default: 'Catalyst',
    },
    description: '',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const events = await getEvents()

    return (
        <html
            lang="en"
            className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
        >
        <body>
        <AuthProvider>
            <ApplicationLayout events={events}>
                {children}
            </ApplicationLayout>
            <ToastContainer />
        </AuthProvider>
        </body>
        </html>
    )
}