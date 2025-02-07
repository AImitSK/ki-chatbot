// app/dashboard/profil/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import { ProfileContent } from '@/components/profile/ProfileContent'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'  // Verhindert Caching dieser Route
export const revalidate = 0             // Deaktiviert Route Cache komplett

export default async function ProfilPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    try {
        const userData = await client.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                email,
                name,
                telefon,
                position,
                role,
                aktiv,
                twoFactorEnabled,
                avatar,
                createdAt,
                updatedAt,
                lastLogin
            }`,
            { email: session.user.email },
            { cache: 'no-store' }  // Deaktiviert Sanity Query Cache
        )

        if (!userData) {
            console.error('Keine Benutzerdaten gefunden für Email:', session.user.email)
            throw new Error('Benutzer nicht gefunden')
        }

        const mappedUserData = {
            id: userData._id,
            email: userData.email,
            name: userData.name,
            telefon: userData.telefon,
            position: userData.position,
            role: userData.role,
            aktiv: userData.aktiv,
            twoFactorEnabled: userData.twoFactorEnabled,
            avatar: userData.avatar,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLogin: userData.lastLogin
        }

        return <ProfileContent initialUserData={mappedUserData} />
    } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error)
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Fehler beim Laden der Benutzerdaten</h2>
                    <p className="text-zinc-500">Bitte versuchen Sie es später erneut</p>
                </div>
            </div>
        )
    }
}