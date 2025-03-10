// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            // Verifizierungs-Route immer erlauben
            if (req.nextUrl.pathname.startsWith('/dashboard/unternehmen/verify-billing')) {
                return true
            }

            // Für alle anderen geschützten Routen Token prüfen
            if (req.nextUrl.pathname.startsWith('/dashboard') ||
                req.nextUrl.pathname.startsWith('/api/projects')) {
                return !!token
            }

            return true
        },
    },
})

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/user/:path*',
        '/api/projects/:path*',
    ],
}