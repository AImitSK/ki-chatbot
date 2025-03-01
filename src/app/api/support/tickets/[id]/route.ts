// src/app/api/support/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { client as sanityClient, writeClient } from '@/lib/sanity/client'
import { sendTicketReplyNotification, sendTicketClosedNotification } from '@/lib/email/sendgrid'
import { z } from 'zod'

// Schema für neue Nachrichten
const messageSchema = z.object({
    message: z.string().min(1),
    attachments: z.array(z.string()).optional()
})

// Schema für Ticket-Status-Updates
const statusUpdateSchema = z.object({
    status: z.enum(['open', 'in_progress', 'pending_customer', 'closed'])
})

// Typdefinitionen
interface TicketMessage {
    sender: 'user' | 'support';
    message: string;
    timestamp: string;
    senderName?: string;
    senderEmail?: string;
    attachments?: Array<{
        _type: string;
        asset: {
            _type: string;
            _ref: string;
        };
    }>;
}

interface Ticket {
    _id: string;
    ticketNumber: string;
    subject: string;
    status: 'open' | 'in_progress' | 'pending_customer' | 'closed';
    messages: TicketMessage[];
    updatedAt: string;
    createdAt: string;
    closedAt?: string;
    createdByUser?: {
        _id: string;
        name: string;
        email: string;
    };
    assignedToUser?: {
        _id: string;
        name: string;
        email: string;
    };
    project?: {
        _id: string;
        titel: string;
    };
    internalNotes?: string;
}

// GET: Details eines bestimmten Tickets abrufen
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const ticketId = params.id

        // Nutzer-ID aus der E-Mail-Adresse abrufen
        const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{_id, role}`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
        }

        // Berechtigungslogik, abhängig von der Benutzerrolle
        let ticketQuery
        if (user.role === 'admin') {
            // Admins können alle Tickets sehen
            ticketQuery = `*[_type == "supportTicket" && _id == $ticketId][0]`
        } else {
            // Normale Benutzer können nur ihre eigenen Tickets sehen
            ticketQuery = `*[_type == "supportTicket" && _id == $ticketId && createdBy._ref == $userId][0]`
        }

        // Ticket mit allen Details abrufen
        const ticket: Ticket = await sanityClient.fetch(
            `${ticketQuery}{
                _id,
                ticketNumber,
                subject,
                status,
                priority,
                createdAt,
                updatedAt,
                closedAt,
                "createdByUser": createdBy->{
                    _id,
                    name,
                    email
                },
                "assignedToUser": assignedTo->{
                    _id,
                    name,
                    email
                },
                "project": projekt->{
                    _id,
                    titel
                },
                messages[] {
                    sender,
                    message,
                    timestamp,
                    senderName,
                    senderEmail,
                    "attachments": attachments[] {
                        "url": asset->url,
                        "filename": asset->originalFilename
                    }
                },
                internalNotes
            }`,
            {
                ticketId,
                userId: user._id
            }
        )

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket nicht gefunden oder keine Berechtigung' }, { status: 404 })
        }

        return NextResponse.json({ ticket, success: true })
    } catch (error) {
        console.error('Fehler beim Abrufen des Tickets:', error)
        return NextResponse.json(
            { error: 'Fehler beim Abrufen des Tickets' },
            { status: 500 }
        )
    }
}

// PATCH: Ticket aktualisieren (neue Nachricht hinzufügen)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const ticketId = params.id
        const body = await req.json()

        // Nutzer-Informationen abrufen
        const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                name,
                email,
                role
            }`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
        }

        // Ticket abrufen, um zu prüfen, ob es existiert
        let ticketQuery
        if (user.role === 'admin') {
            // Admins können alle Tickets aktualisieren
            ticketQuery = `*[_type == "supportTicket" && _id == $ticketId][0]`
        } else {
            // Normale Benutzer können nur ihre eigenen Tickets aktualisieren
            ticketQuery = `*[_type == "supportTicket" && _id == $ticketId && createdBy._ref == $userId][0]`
        }

        const ticket: Ticket = await sanityClient.fetch(
            `${ticketQuery}{
                _id,
                ticketNumber,
                subject,
                status,
                messages,
                updatedAt,
                "createdByUser": createdBy->{
                    _id,
                    name,
                    email
                }
            }`,
            {
                ticketId,
                userId: user._id
            }
        )

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket nicht gefunden oder keine Berechtigung' }, { status: 404 })
        }

        // Update-Operationen vorbereiten
        let updates: Record<string, any> = {}

        // 1. Neue Nachricht hinzufügen, falls vorhanden
        if (body.message) {
            const validationResult = messageSchema.safeParse(body)
            if (!validationResult.success) {
                return NextResponse.json(
                    { error: 'Ungültige Nachricht', details: validationResult.error.format() },
                    { status: 400 }
                )
            }

            const { message, attachments } = validationResult.data

            // Neue Nachricht erstellen
            const newMessage: TicketMessage = {
                sender: 'user',
                message,
                timestamp: new Date().toISOString(),
                senderName: user.name,
                senderEmail: user.email,
                attachments: attachments ? attachments.map(attachment => ({
                    _type: 'file',
                    asset: {
                        _type: 'reference',
                        _ref: attachment
                    }
                })) : []
            }

            // Wenn das Ticket geschlossen war und eine neue Nachricht hinzugefügt wird, wieder öffnen
            if (ticket.status === 'closed') {
                updates.status = 'open'
            }

            // Nachricht zum Ticket hinzufügen
            updates.messages = [...ticket.messages, newMessage]
            updates.updatedAt = new Date().toISOString()

            // Support per E-Mail benachrichtigen (falls die Nachricht vom Kunden kommt)
            if (user.role !== 'admin') {
                try {
                    await sendTicketReplyNotification({
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        message,
                        recipientName: 'Support-Team',
                        recipientEmail: process.env.SUPPORT_EMAIL || 'support@sk-online-marketing.de'
                    })
                } catch (error) {
                    console.error('Fehler beim Senden der E-Mail-Benachrichtigung:', error)
                    // Wir werfen hier keinen Fehler, um den Prozess nicht zu unterbrechen
                }
            }
        }

        // 2. Status aktualisieren, falls vorhanden
        if (body.status) {
            const validationResult = statusUpdateSchema.safeParse(body)
            if (!validationResult.success) {
                return NextResponse.json(
                    { error: 'Ungültiger Status', details: validationResult.error.format() },
                    { status: 400 }
                )
            }

            const { status } = validationResult.data

            // Status aktualisieren
            updates.status = status
            updates.updatedAt = new Date().toISOString()

            // Bei Schließung des Tickets Zeitstempel setzen
            if (status === 'closed' && ticket.status !== 'closed') {
                updates.closedAt = new Date().toISOString()

                // Benachrichtigung über Ticket-Schließung senden
                try {
                    await sendTicketClosedNotification({
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        recipientName: ticket.createdByUser?.name || 'Kunde',
                        recipientEmail: ticket.createdByUser?.email || session.user.email
                    })
                } catch (error) {
                    console.error('Fehler beim Senden der Schließungs-Benachrichtigung:', error)
                    // Wir werfen hier keinen Fehler, um den Prozess nicht zu unterbrechen
                }
            }
        }

        // Ticket aktualisieren, wenn Updates vorhanden sind
        if (Object.keys(updates).length > 0) {
            const updatedTicket = await writeClient
                .patch(ticketId)
                .set(updates)
                .commit()

            // Activity-Log erstellen
            await writeClient.create({
                _type: 'activityLog',
                activityType: body.message ? 'ticket.message_added' : 'ticket.status_changed',
                details: body.message
                    ? `Neue Nachricht zu Ticket ${ticket.ticketNumber} hinzugefügt`
                    : `Status von Ticket ${ticket.ticketNumber} geändert zu ${body.status}`,
                timestamp: new Date().toISOString(),
                userId: user._id,
                userEmail: user.email
            })

            return NextResponse.json({ ticket: updatedTicket, success: true })
        } else {
            return NextResponse.json(
                { error: 'Keine Änderungen angegeben' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Tickets:', error)
        return NextResponse.json(
            { error: 'Fehler beim Aktualisieren des Tickets' },
            { status: 500 }
        )
    }
}

// DELETE: Ticket löschen (nur für Admins)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const ticketId = params.id

        // Nutzer-Informationen abrufen
        const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                name,
                email,
                role
            }`,
            { email: session.user.email }
        )

        // Nur Admins dürfen Tickets löschen
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Keine Berechtigung zum Löschen von Tickets' }, { status: 403 })
        }

        // Ticket abrufen, um zu prüfen, ob es existiert
        const ticket = await sanityClient.fetch(
            `*[_type == "supportTicket" && _id == $ticketId][0]{
                ticketNumber
            }`,
            { ticketId }
        )

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404 })
        }

        // Ticket löschen
        await writeClient.delete(ticketId)

        // Activity-Log erstellen
        await writeClient.create({
            _type: 'activityLog',
            activityType: 'ticket.deleted',
            details: `Ticket ${ticket.ticketNumber} gelöscht`,
            timestamp: new Date().toISOString(),
            userId: user._id,
            userEmail: user.email
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Fehler beim Löschen des Tickets:', error)
        return NextResponse.json(
            { error: 'Fehler beim Löschen des Tickets' },
            { status: 500 }
        )
    }
}