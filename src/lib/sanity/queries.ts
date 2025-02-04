// src/lib/sanity/queries.ts
import { client } from '@/lib/sanity/client';

export const getUserData = async () => {
    try {
        const userData = await client.fetch(
            `*[_type == "user" && _id == $userId][0]`,
            { userId: 'current-user-id' } // Die tatsächliche Benutzer-ID hier einfügen
        );
        return userData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        throw new Error('Benutzerdaten konnten nicht abgerufen werden');
    }
};