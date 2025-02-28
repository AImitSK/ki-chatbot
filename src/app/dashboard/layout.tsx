// src/app/dashboard/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode
}) {
    const session = await getServerSession()

    if (!session) {
        redirect('/auth/login')
    }

    return (
        <div className="bg-white">
            {children}
            <Toaster position="top-right" />
        </div>
    )
}