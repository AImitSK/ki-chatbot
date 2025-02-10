// src/app/api/company/billing-recipient/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { writeClient } from '@/lib/sanity/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendBillingInvitation } from '@/lib/email/sendgrid'

function generateToken(): string {
    return randomBytes(32).toString('hex')
}

export async function POST(req: Request) {
    try {
        console.log('--- [DEBUG] POST /api/company/billing-recipient gestartet ---');

        const session = await getServerSession(authOptions)
        console.log('Session-User:', session?.user);

        if (!session?.user?.id || session.user.role !== 'admin') {
            console.log('❌ Unbefugter Zugriff: Kein Admin-User');
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { name, email, telefon, position, companyId } = await req.json()
        console.log('Empfangene Daten:', { name, email, telefon, position, companyId });

        // Prüfe, ob der Benutzer bereits als User existiert
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        );

        if (existingUser) {
            console.log('❌ Benutzer existiert bereits als registrierter User:', existingUser);
            return new NextResponse('Dieser Benutzer hat bereits ein Konto.', { status: 400 });
        }

        console.log('📌 Benutzer existiert nicht als registrierter User, Einladung kann verschickt werden.');

        // Prüfe, ob das Unternehmen existiert
        const company = await writeClient.fetch(
            `*[_type == "unternehmen" && _id == $companyId][0]`,
            { companyId }
        );

        if (!company) {
            console.error('❌ Fehler: Unternehmen nicht gefunden für ID:', companyId);
            return new NextResponse('Unternehmen nicht gefunden', { status: 400 });
        }

        console.log('✅ Gefundenes Unternehmen:', company.name);

        // Prüfe, ob bereits eine Einladung existiert
        const existingInvite = await writeClient.fetch(
            `*[_type == "billingInvite" && email == $email][0]`,
            { email }
        );

        if (existingInvite) {
            console.log('📩 Einladung existiert bereits, erneut senden:', existingInvite);

            // Sende die Einladung erneut
            await sendBillingInvitation(
                email,
                existingInvite.name,
                company.name,
                existingInvite.token,
                existingInvite.tempPassword
            );

            console.log('✅ Einladung wurde erneut gesendet an:', email);
            return NextResponse.json({
                message: 'Einladung wurde erneut gesendet',
                invitation: {
                    email,
                    name: existingInvite.name,
                    expiresAt: existingInvite.expiresAt
                }
            });
        }

        console.log('📌 Keine bestehende Einladung gefunden, erstelle eine neue.');

        // Falls keine bestehende Einladung existiert, erstelle eine neue
        const tempPassword = Math.random().toString(36).slice(-8);
        const token = generateToken();

        const newInvite = await writeClient.create({
            _type: 'billingInvite',
            token,
            email,
            name,
            telefon,
            position,
            companyId,
            tempPassword,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h gültig
            createdAt: new Date().toISOString()
        });

        console.log('✅ Neue Einladung erfolgreich erstellt:', newInvite);

        // Sende die Einladung per E-Mail
        await sendBillingInvitation(email, name, company.name, token, tempPassword);
        console.log('✅ Neue Einladung wurde gesendet an:', email);

        return NextResponse.json({
            message: 'Neue Einladung wurde gesendet',
            invitation: {
                email,
                name,
                expiresAt: newInvite.expiresAt
            }
        });
    } catch (error) {
        console.error('❌ Fehler beim Erstellen des Rechnungsempfängers:', error);
        return new NextResponse(
            'Fehler beim Erstellen des Rechnungsempfängers',
            { status: 500 }
        )
    }
}


export async function PUT(req: Request) {
    try {
        console.log('--- [DEBUG] PUT /api/company/billing-recipient gestartet ---');

        const session = await getServerSession(authOptions)
        console.log('Session-User:', session?.user);

        if (!session?.user?.id || session.user.role !== 'admin') {
            console.log('❌ Unbefugter Zugriff: Kein Admin-User');
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { name, email, telefon, position, userId } = await req.json()
        console.log('Empfangene Daten für Update:', { name, email, telefon, position, userId });

        if (!userId) {
            console.log('❌ Fehler: User ID ist erforderlich');
            return new NextResponse('User ID ist erforderlich', { status: 400 })
        }

        // Prüfe ob der User existiert und ein Rechnungsempfänger ist
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && _id == $userId && role == "billing"][0]`,
            { userId }
        )

        if (!existingUser) {
            console.log('❌ Fehler: Rechnungsempfänger nicht gefunden');
            return new NextResponse('Rechnungsempfänger nicht gefunden', { status: 404 })
        }

        // Prüfe ob die neue Email bereits von einem anderen User verwendet wird
        if (email !== existingUser.email) {
            const emailExists = await writeClient.fetch(
                `*[_type == "user" && email == $email && _id != $userId][0]._id`,
                { email, userId }
            )

            if (emailExists) {
                console.log('❌ Fehler: Email wird bereits von einem anderen Benutzer verwendet');
                return new NextResponse('Email wird bereits verwendet', { status: 400 })
            }
        }

        // Update den User
        const updatedUser = await writeClient
            .patch(userId)
            .set({
                name,
                email,
                telefon,
                position,
                updatedAt: new Date().toISOString()
            })
            .commit();

        console.log('✅ Rechnungsempfänger wurde aktualisiert:', updatedUser);

        return NextResponse.json({ user: updatedUser })
    } catch (error) {
        console.error('❌ Fehler beim Aktualisieren des Rechnungsempfängers:', error);
        return new NextResponse(
            'Fehler beim Aktualisieren des Rechnungsempfängers',
            { status: 500 }
        )
    }
}
