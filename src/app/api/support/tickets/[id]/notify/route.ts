// src/app/api/support/tickets/[id]/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { client as sanityClient } from '@/lib/sanity/client';
import { sendTicketReplyNotification, sendTicketClosedNotification } from '@/lib/email/sendgrid';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
        }

        const ticketId = params.id;
        const body = await req.json();
        const { type, message } = body;

        console.log(`[NOTIFY] Notification request for ticket ${ticketId}, type: ${type}`);

        // Ticket abrufen
        const ticket = await sanityClient.fetch(
            `*[_type == "supportTicket" && _id == $ticketId][0]{
                ticketNumber,
                subject,
                "createdByUser": createdBy->{
                    name,
                    email
                }
            }`,
            { ticketId }
        );

        if (!ticket) {
            console.error(`[NOTIFY] Ticket ${ticketId} nicht gefunden`);
            return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404 });
        }

        console.log(`[NOTIFY] Found ticket: ${ticket.ticketNumber}, recipient: ${ticket.createdByUser.email}`);

        // E-Mail-Versand basierend auf Typ
        if (type === 'reply') {
            console.log(`[NOTIFY] Sending reply notification to ${ticket.createdByUser.email}`);
            await sendTicketReplyNotification({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                message: message || "Eine neue Antwort wurde zu Ihrem Ticket hinzugefügt.",
                recipientName: ticket.createdByUser.name,
                recipientEmail: ticket.createdByUser.email
            });
            console.log(`[NOTIFY] Reply notification sent for ticket ${ticket.ticketNumber}`);
        } else if (type === 'closed') {
            console.log(`[NOTIFY] Sending closed notification to ${ticket.createdByUser.email}`);
            await sendTicketClosedNotification({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                recipientName: ticket.createdByUser.name,
                recipientEmail: ticket.createdByUser.email
            });
            console.log(`[NOTIFY] Closed notification sent for ticket ${ticket.ticketNumber}`);
        } else {
            return NextResponse.json(
                { error: 'Ungültiger Benachrichtigungstyp' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Benachrichtigung vom Typ "${type}" erfolgreich gesendet`
        });
    } catch (error: any) {
        console.error('Fehler beim Benachrichtigen:', error);
        return NextResponse.json(
            { error: 'Fehler beim Senden der Benachrichtigung', details: error?.message || 'Unbekannter Fehler' },
            { status: 500 }
        );
    }
}

// Für eine einfache Testseite zur manuellen Benachrichtigung
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
        }

        const ticketId = params.id;

        // Ticket abrufen
        const ticket = await sanityClient.fetch(
            `*[_type == "supportTicket" && _id == $ticketId][0]{
                ticketNumber,
                subject,
                status,
                "createdByUser": createdBy->{
                    name,
                    email
                }
            }`,
            { ticketId }
        );

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({
            ticket: {
                id: ticketId,
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                status: ticket.status,
                recipient: ticket.createdByUser
            },
            success: true
        });
    } catch (error: any) {
        console.error('Fehler beim Abrufen des Tickets für Benachrichtigung:', error);
        return NextResponse.json(
            { error: 'Fehler beim Abrufen des Tickets', details: error?.message || 'Unbekannter Fehler' },
            { status: 500 }
        );
    }
}