'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, studioTheme } from '@sanity/ui'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider theme={studioTheme}>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
