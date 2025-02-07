// hooks/useUpdate.ts
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function useUpdate() {
    const router = useRouter()
    const { update } = useSession()

    const refresh = useCallback(async () => {
        await update()
        router.refresh()
    }, [update, router])

    return { refresh }
}