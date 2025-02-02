// app/dashboard/profil/page.tsx
import { Heading } from '@/components/ui/heading'
import { getUserData } from '@/lib/sanity/queries'
import { ProfileClient } from '@/components/profile/ProfileClient'  // Neuer Import

export default async function ProfilPage() {
    try {
        const userData = await getUserData()

        return (
            <div className="space-y-8">
                <Heading>Profil</Heading>
                <ProfileClient userData={userData} />
            </div>
        )
    } catch (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-500 text-white p-4 rounded">
                    <h2 className="text-lg font-bold">Fehler</h2>
                    <p>Benutzer nicht angemeldet</p>
                </div>
            </div>
        )
    }
}