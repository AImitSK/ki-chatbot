// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { ApplicationLayout } from './application-layout'
import AuthProvider from '@/components/providers/SessionProvider'
import { ToastContainer } from '@/components/ui/toast'

export const metadata: Metadata = {
    title: 'SK Online Marketing',
    description: 'Chatbot Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de" className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950">
        <body>
        <AuthProvider>
            <ApplicationLayout>
                {children}
            </ApplicationLayout>
            <ToastContainer />
        </AuthProvider>
        </body>
        </html>
    )
}