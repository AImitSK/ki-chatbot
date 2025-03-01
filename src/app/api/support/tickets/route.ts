// src/app/api/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { client as sanityClient, writeClient } from '@/lib/sanity/client'
import { sendNewTicketNotification } from '@/lib/email/sendgrid'
import { z } from 'zod'

// Schema für neue Tickets
const newTicketSchema = z.object({
    subject: z.string().min(3).max(100),
    message: z.string().min(10),
    priority: z.enum(['low', 'medium', 'high']),
    projectId: z.string().optional(),
    attachments: z.array(z.string()).optional()
})

// Ticket-Datentyp
interface TicketData {
    _type: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: "medium" | "low" | "high";
    createdBy: { _type: string; _ref: string };
    messages: {
        sender: string;
        message: string;
        timestamp: string;
        senderName: string;
        senderEmail: string;
        attachments: {
            _type: string;
            asset: {
                _type: string;
                _ref: string;
            };
        }[];
    }[];
    createdAt: string;
    updatedAt: string;
    projekt?: { _type: string; _ref: string };  // Optional projektId
    internalNotes?: string;
}

// Generiere Ticket-Nummer
function generateTicketNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4-stellige Zufallszahl
    return `TCK-${year}-${random}`;
}

// GET: Tickets des aktuellen Benutzers abrufen
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        // Nutzer-ID aus der E-Mail-Adresse abrufen
        const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{_id}`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
        }

        // Alle Tickets des Benutzers abrufen
        const tickets = await sanityClient.fetch(
            `*[_type == "supportTicket" && createdBy._ref == $userId] | order(createdAt desc){
                _id,
                ticketNumber,
                subject,
                status,
                priority,
                createdAt,
                updatedAt,
                "project": projekt->titel,
                "messages": messages[] {
                    sender,
                    message,
                    timestamp
                }
            }`,
            { userId: user._id }
        )

        return NextResponse.json({ tickets })
    } catch (error) {
        console.error('Fehler beim Abrufen der Tickets:', error)
        return NextResponse.json(
            { error: 'Fehler beim Abrufen der Tickets' },
            { status: 500 }
        )
    }
}

// POST: Neues Ticket erstellen
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
        }

        const body = await req.json()

        // Daten validieren
        const validationResult = newTicketSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Ungültige Daten', details: validationResult.error.format() },
                { status: 400 }
            )
        }

        const { subject, message, priority, projectId, attachments } = validationResult.data

        // Nutzer-Informationen abrufen
        const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]{
                _id,
                name,
                email
            }`,
            { email: session.user.email }
        )

        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
        }

        // Ticket-Nummer generieren
        const ticketNumber = generateTicketNumber()

        // Nachrichten-Array erstellen
        const messages = [{
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
        }]

        // Neues Ticket erstellen
        const ticketData: TicketData = {
            _type: 'supportTicket',
            ticketNumber,
            subject,
            status: 'open',
            priority,
            createdBy: { _type: 'reference', _ref: user._id },
            messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // Projekt-Referenz hinzufügen, falls vorhanden
        if (projectId) {
            ticketData.projekt = { _type: 'reference', _ref: projectId }
        }

        // Ticket in Sanity erstellen
        const ticket = await writeClient.create(ticketData)

        // Support-Team über das neue Ticket informieren
        await sendNewTicketNotification({
            ticketNumber,
            subject,
            message,
            userName: user.name,
            userEmail: user.email,
            priority
        })

        // Activity-Log erstellen
        await writeClient.create({
            _type: 'activityLog',
            activityType: 'ticket.created',
            details: `Ticket ${ticketNumber} erstellt: ${subject}`,
            timestamp: new Date().toISOString(),
            userId: user._id,
            userEmail: user.email
        })

        return NextResponse.json({ ticket, success: true }, { status: 201 })
    } catch (error) {
        console.error('Fehler beim Erstellen eines Tickets:', error)
        return NextResponse.json(
            { error: 'Fehler beim Erstellen eines Tickets' },
            { status: 500 }
        )
    }
}