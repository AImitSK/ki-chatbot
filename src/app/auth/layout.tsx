// src/app/auth/layout.tsx
import { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'Login - SK Online Marketing',
    description: 'Loggen Sie sich in Ihr Dashboard ein',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    )
}