// components/profile/SecuritySettings.tsx
import { User } from '@/types'

interface SecuritySettingsProps {
    user: User
}

export const SecuritySettings = ({ user }: SecuritySettingsProps) => {
    // Logik zum Ändern der Sicherheitseinstellungen
    return (
        <div>
            <h3 className="text-lg font-medium">Sicherheitseinstellungen</h3>
            {/* Passwort-Änderung, 2FA, etc. */}
        </div>
    )
}