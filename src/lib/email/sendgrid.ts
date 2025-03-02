// lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY fehlt in den Umgebungsvariablen')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Email-Templates definieren
const TEMPLATES = {
    EMAIL_CHANGE: 'd-976b58550a5743f99b199227dd4250d4',
    BILLING_INVITE: 'd-1befa79015354ee0b4fdcbd189a8b8af',
    // Neue Templates für das Ticket-System
    NEW_TICKET: process.env.SENDGRID_TEMPLATE_NEW_TICKET || 'd-d624125df1554f69b9b34701ab222d17',
    TICKET_CONFIRMATION: process.env.SENDGRID_TEMPLATE_TICKET_CONFIRMATION || 'd-d1685b6972794568ab6007c9c56d412d',
    TICKET_UPDATE: process.env.SENDGRID_TEMPLATE_TICKET_UPDATE || 'd-cf69f6567f1d44ff89acb7286ed79f87',
    TICKET_REPLY: process.env.SENDGRID_TEMPLATE_TICKET_REPLY || 'd-ea49efa84dee41cfb57ff43fb6c7aeb6',
    TICKET_CLOSED: process.env.SENDGRID_TEMPLATE_TICKET_CLOSED || 'd-cf080f8cab37491dafba7127d94c32f7'
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

// Neue Interfaces für Ticket-Related Emails
interface TicketNotificationData {
    ticketNumber: string
    subject: string
    message: string
    userName: string
    userEmail: string
    priority: string
}

interface TicketReplyData {
    ticketNumber: string
    subject: string
    message: string
    recipientName: string
    recipientEmail: string
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

// Neue Funktionen für das Ticket-System

/**
 * Sendet eine Benachrichtigung an das Support-Team, wenn ein neues Ticket erstellt wird
 */
export async function sendNewTicketNotification(data: TicketNotificationData) {
    try {
        const supportEmail = process.env.SUPPORT_EMAIL || 'support@sk-online-marketing.de';

        console.log('--- [DEBUG] Sende New-Ticket-Notification:');
        console.log('Empfänger:', supportEmail);
        console.log('Ticket:', data.ticketNumber);
        console.log('Betreff:', data.subject);
        console.log('Von:', data.userName, data.userEmail);
        console.log('Priorität:', data.priority);

        const msg = {
            to: supportEmail,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: 'SK Online Marketing Support',
            },
            replyTo: data.userEmail,
            templateId: TEMPLATES.NEW_TICKET,
            dynamicTemplateData: {
                ticketNumber: data.ticketNumber,
                subject: data.subject,
                message: data.message,
                userName: data.userName,
                userEmail: data.userEmail,
                priority: data.priority,
                dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/studio/desk/supportTicket`
            }
        };

        await sgMail.send(msg);
        console.log('✅ Ticket-Benachrichtigung erfolgreich gesendet an:', supportEmail);

        // Bestätigungsmail an den Kunden senden
        await sendTicketConfirmation({
            ticketNumber: data.ticketNumber,
            subject: data.subject,
            recipientName: data.userName,
            recipientEmail: data.userEmail
        });

        return true;
    } catch (error) {
        console.error('❌ SendGrid Fehler bei Ticket-Benachrichtigung:', error);
        throw new Error('Fehler beim Senden der Ticket-Benachrichtigung');
    }
}

/**
 * Sendet eine Bestätigung an den Kunden, dass sein Ticket eingegangen ist
 */
export async function sendTicketConfirmation(data: {
    ticketNumber: string;
    subject: string;
    recipientName: string;
    recipientEmail: string;
}) {
    try {
        console.log('--- [DEBUG] Sende Ticket-Confirmation:');
        console.log('Empfänger:', data.recipientEmail);
        console.log('Ticket:', data.ticketNumber);

        const msg = {
            to: data.recipientEmail,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: 'SK Online Marketing Support',
            },
            templateId: TEMPLATES.TICKET_CONFIRMATION,
            dynamicTemplateData: {
                ticketNumber: data.ticketNumber,
                subject: data.subject,
                recipientName: data.recipientName,
                dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/support`
            }
        };

        await sgMail.send(msg);
        console.log('✅ Ticket-Bestätigung erfolgreich gesendet an:', data.recipientEmail);
        return true;
    } catch (error) {
        console.error('❌ SendGrid Fehler bei Ticket-Bestätigung:', error);
        throw new Error('Fehler beim Senden der Ticket-Bestätigung');
    }
}

/**
 * Sendet eine Benachrichtigung, wenn ein Support-Mitarbeiter auf ein Ticket antwortet
 */
export async function sendTicketReplyNotification(data: TicketReplyData) {
    try {
        console.log('--- [DEBUG] Sende Ticket-Reply-Notification:');
        console.log('Empfänger:', data.recipientEmail);
        console.log('Ticket:', data.ticketNumber);

        const msg = {
            to: data.recipientEmail,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: 'SK Online Marketing Support',
            },
            templateId: TEMPLATES.TICKET_REPLY,
            dynamicTemplateData: {
                ticketNumber: data.ticketNumber,
                subject: data.subject,
                message: data.message,
                recipientName: data.recipientName,
                dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/support`
            }
        };

        await sgMail.send(msg);
        console.log('✅ Ticket-Antwort-Benachrichtigung erfolgreich gesendet an:', data.recipientEmail);
        return true;
    } catch (error) {
        console.error('❌ SendGrid Fehler bei Ticket-Antwort:', error);
        throw new Error('Fehler beim Senden der Ticket-Antwort-Benachrichtigung');
    }
}

/**
 * Sendet eine Benachrichtigung, wenn ein Ticket geschlossen wurde
 */
export async function sendTicketClosedNotification(data: {
    ticketNumber: string;
    subject: string;
    recipientName: string;
    recipientEmail: string;
}) {
    try {
        console.log('--- [DEBUG] Sende Ticket-Closed-Notification:');
        console.log('Empfänger:', data.recipientEmail);
        console.log('Ticket:', data.ticketNumber);

        const msg = {
            to: data.recipientEmail,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL!,
                name: 'SK Online Marketing Support',
            },
            templateId: TEMPLATES.TICKET_CLOSED,
            dynamicTemplateData: {
                ticketNumber: data.ticketNumber,
                subject: data.subject,
                recipientName: data.recipientName,
                dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/support`
            }
        };

        await sgMail.send(msg);
        console.log('✅ Ticket-Abschluss-Benachrichtigung erfolgreich gesendet an:', data.recipientEmail);
        return true;
    } catch (error) {
        console.error('❌ SendGrid Fehler bei Ticket-Abschluss:', error);
        throw new Error('Fehler beim Senden der Ticket-Abschluss-Benachrichtigung');
    }
}