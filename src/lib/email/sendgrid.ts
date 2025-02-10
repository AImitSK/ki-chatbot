// lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY fehlt in den Umgebungsvariablen')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Email-Templates definieren
const TEMPLATES = {
    EMAIL_CHANGE: 'd-976b58550a5743f99b199227dd4250d4',
    BILLING_INVITE: 'd-1befa79015354ee0b4fdcbd189a8b8af'
}

interface EmailTemplateData {
    userName: string
    verificationLink: string
}

interface BillingInviteTemplateData {
    userName: string
    companyName: string
    verificationLink: string
    tempPassword: string
}

export async function sendChangeEmailVerification(
    to: string,
    token: string,
    userName: string
) {
    const verificationLink = `${process.env.NEXT_PUBLIC_URL}/dashboard/profil/verify-email?token=${token}`

    console.log('--- [DEBUG] Sende Change-Email-Verification:');
    console.log('Empfänger:', to);
    console.log('Token:', token);
    console.log('Benutzername:', userName);
    console.log('Verifizierungslink:', verificationLink);

    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL!,
            name: 'SK Online Marketing',
        },
        templateId: TEMPLATES.EMAIL_CHANGE,
        dynamicTemplateData: {
            userName,
            verificationLink,
        },
    }

    try {
        await sgMail.send(msg)
        console.log('✅ Email erfolgreich gesendet an:', to)
    } catch (error) {
        console.error('❌ SendGrid Fehler:', error)
        throw new Error('Fehler beim Senden der Email')
    }
}

export async function sendBillingInvitation(
    to: string,
    userName: string,
    companyName: string,
    token: string,
    tempPassword: string
) {
    const verificationLink = `${process.env.NEXT_PUBLIC_URL}/dashboard/unternehmen/verify-billing?token=${token}`;

    console.log('--- [DEBUG] Sende Billing-Invitation:');
    console.log('Empfänger:', to);
    console.log('Benutzername:', userName);
    console.log('Unternehmen:', companyName);
    console.log('Token:', token);
    console.log('Temporäres Passwort:', tempPassword);
    console.log('Verifizierungslink:', verificationLink);

    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL!,
            name: 'SK Online Marketing',
        },
        templateId: TEMPLATES.BILLING_INVITE,
        dynamicTemplateData: {
            userName,
            companyName,
            userEmail: to, // 🔥 Hier sicherstellen, dass die Email im Template verfügbar ist
            verificationLink,
            tempPassword,
        },
    };

    try {
        const response = await sgMail.send(msg);
        console.log('✅ Einladung erfolgreich gesendet an:', to, 'Response:', response);
    } catch (error) {
        console.error('❌ SendGrid Fehler:', error);
        throw new Error('Fehler beim Senden der Email');
    }
}

