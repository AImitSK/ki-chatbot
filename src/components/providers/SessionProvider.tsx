// components/providers/SessionProvider.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, studioTheme } from '@sanity/ui'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
            <ThemeProvider theme={studioTheme}>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}