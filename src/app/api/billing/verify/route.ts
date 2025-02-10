import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity/client'

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        console.log('--- Verifizierungs-Token erhalten:', token);

        // 1️⃣ Einladung prüfen
        const invite = await writeClient.fetch(
            `*[_type == "billingInvite" && token == $token][0]`,
            { token }
        );

        if (!invite) {
            console.error('❌ Einladung nicht gefunden oder abgelaufen.');
            return new NextResponse('Ungültige oder abgelaufene Einladung.', { status: 400 });
        }

        console.log('✅ Einladung gefunden:', invite);

        // 2️⃣ Benutzer prüfen/erstellen
        let userId;
        let existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: invite.email }
        );

        if (!existingUser) {
            console.log('📌 Benutzer existiert noch nicht, erstelle neuen User.');

            const newUser = await writeClient.create({
                _type: 'user',
                name: invite.name,
                email: invite.email,
                telefon: invite.telefon,
                position: invite.position,
                password: invite.tempPassword,
                aktiv: true,
                createdAt: new Date().toISOString()
            });

            if (!newUser?._id) {
                console.error('❌ Fehler: Neuer Benutzer konnte nicht erstellt werden.');
                return new NextResponse('Fehler beim Erstellen des Benutzers.', { status: 500 });
            }

            userId = newUser._id;
            console.log('✅ Neuer Benutzer erfolgreich erstellt:', userId);

            // 2.1 Warten, bis Sanity den User synchronisiert (2s)
            console.log('⏳ Warte 2s auf Sanity-Synchronisation...');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 2.2 Sicherstellen, dass der User jetzt in der DB existiert
            const checkUser = await writeClient.fetch(
                `*[_type == "user" && _id == $userId][0]`,
                { userId }
            );

            if (!checkUser) {
                console.error('❌ Fehler: User existiert nach Wartezeit nicht.');
                return new NextResponse('Fehler bei der Verknüpfung mit dem Projekt.', { status: 500 });
            }
        } else {
            userId = existingUser._id;
            console.log('✅ Benutzer existiert bereits, benutze existierende ID:', userId);
        }

        // 3️⃣ Letzte Sicherheitsprüfung: User existiert in Sanity?
        const finalCheck = await writeClient.fetch(
            `*[_type == "user" && _id == $userId][0]`,
            { userId }
        );

        if (!finalCheck) {
            console.error('❌ Fehler: Benutzer wurde in Sanity nicht gefunden.');
            return new NextResponse('Benutzer konnte nicht mit Projekt verknüpft werden.', { status: 500 });
        }

        // 4️⃣ Erst jetzt Benutzer in Projekt eintragen
        console.log('📌 Benutzer wird als Rechnungsempfänger und Berechtigter User in das Projekt eingetragen.');
        const updatedProject = await writeClient
            .patch(invite.companyId)
            .set({ rechnungsempfaenger: { _ref: userId, _type: 'reference' } })
            .insert('after', 'users[-1]', [{ _ref: userId, _type: 'reference' }])
            .commit();

        console.log('✅ Benutzer wurde als Rechnungsempfänger & Berechtigter User eingetragen:', updatedProject);

        // 5️⃣ Einladung erst jetzt löschen, nachdem ALLES stabil gespeichert wurde
        await writeClient.delete(invite._id);
        console.log('🗑️ Einladung wurde gelöscht.');

        return NextResponse.json({
            message: 'Verifizierung erfolgreich, Benutzer wurde mit dem Projekt verknüpft.',
            userId
        });
    } catch (error) {
        console.error('❌ Fehler bei der Verifizierung:', error);
        return new NextResponse('Fehler bei der Verifizierung.', { status: 500 });
    }
}
