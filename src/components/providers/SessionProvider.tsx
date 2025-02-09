// components/providers/SessionProvider.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, studioTheme } from '@sanity/ui'
import { SWRConfig } from 'swr'

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.')
        error.message = await res.text()
        throw error
    }
    return res.json()
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
            <ThemeProvider theme={studioTheme}>
                <SWRConfig
                    value={{
                        fetcher: fetcher,
                        revalidateOnFocus: false,
                    }}
                >
                    {children}
                </SWRConfig>
            </ThemeProvider>
        </SessionProvider>
    )
}