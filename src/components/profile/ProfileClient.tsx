// components/profile/ProfileClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

export function ProfileClient() {
    const [userData, setUserData] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('/api/user/profile');
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Daten');
                }
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Fehler beim Laden der Benutzerdaten:', error);
                setError('Fehler beim Laden der Benutzerdaten');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (isLoading) return <div>Laden...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>Keine Benutzerdaten gefunden</div>;

    return (
        <div>
            <h1>Hallo, {userData.name}</h1>
            <p>Email: {userData.email}</p>
            {/* Weitere Benutzerinformationen hier */}
        </div>
    );
}