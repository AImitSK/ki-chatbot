// app/dashboard/profil/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { client } from '@/lib/sanity/client'
import { ProfileContent } from '@/components/profile/ProfileContent'

export default async function ProfilPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return null
    }

    const userData = await client.fetch(
        `*[_type == "user" && _id == $id][0]`,
        { id: session.user.id }
    )

    return <ProfileContent initialUserData={userData} />
}