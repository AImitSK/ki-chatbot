// lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

// SendGrid API Key setzen
if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY fehlt in den Umgebungsvariablen')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Email-Templates definieren
const TEMPLATES = {
    EMAIL_CHANGE: 'd-976b58550a5743f99b199227dd4250d4', // Hier deine Template-ID einsetzen
}

interface EmailChangeTemplateData {
    userName: string
    verificationLink: string
}

export async function sendChangeEmailVerification(
    to: string,
    token: string,
    userName: string
) {
    const verificationLink = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`

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
    } catch (error) {
        console.error('SendGrid Fehler:', error)
        throw new Error('Fehler beim Senden der Email')
    }
}