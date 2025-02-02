// components/profile/AccountSettings.tsx
import { User } from '@/types'

interface AccountSettingsProps {
    user: User
}

export const AccountSettings = ({ user }: AccountSettingsProps) => {
    // Logik zum Ändern der Kontoeinstellungen
    return (
        <div>
            <h3 className="text-lg font-medium">Kontoeinstellungen</h3>
            <p>Email: {user.email}</p>
            {/* Weitere Einstellungen */}
        </div>
    )
}