// src/app/api/support/tickets/[id]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { client as sanityClient, writeClient } from '@/lib/sanity/client'
import { sendTicketReplyNotification } from '@/lib/email/sendgrid'
import { z } from 'zod'

// Schema für Support-Antworten
const replySchema = z.object({
    message: z.string().min(1),
    attachments: z.array(z.string()).optional(),
    internalNote: z.string().optional()
})

// POST: Als Support-Mitarbeiter antworten
export async function POST(
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

        // Daten validieren
        const validationResult = replySchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Ungültige Daten', details: validationResult.error.format() },
                { status: 400 }
            )
        }

        const { message, attachments, internalNote } = validationResult.data

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

        // Nur Admins dürfen als Support antworten
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Keine Berechtigung für Support-Antworten' }, { status: 403 })
        }

        // Ticket abrufen
        const ticket = await sanityClient.fetch(
            `*[_type == "supportTicket" && _id == $ticketId][0]{
                _id,
                ticketNumber,
                subject,
                status,
                messages,
                internalNotes,
                "createdByUser": createdBy->{
                    _id,
                    name,
                    email
                }
            }`,
            { ticketId }
        )

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404 })
        }

        // Updates vorbereiten
        const updates: Record<string, any> = {
            updatedAt: new Date().toISOString()
        }

        // Support-Antwort hinzufügen
        const newMessage = {
            sender: 'support',
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

        updates.messages = [...ticket.messages, newMessage]

        // Wenn der Status "Offen" ist, auf "In Bearbeitung" setzen
        if (ticket.status === 'open') {
            updates.status = 'in_progress'
        }

        // Optional: Support-Mitarbeiter dem Ticket zuweisen, falls noch nicht geschehen
        updates.assignedTo = { _type: 'reference', _ref: user._id }

        // Interne Notiz hinzufügen, falls vorhanden
        if (internalNote) {
            const newNotes = ticket.internalNotes
                ? `${ticket.internalNotes}\n\n${new Date().toLocaleDateString('de-DE')} - ${user.name}:\n${internalNote}`
                : `${new Date().toLocaleDateString('de-DE')} - ${user.name}:\n${internalNote}`

            updates.internalNotes = newNotes
        }

        // Ticket aktualisieren
        const updatedTicket = await writeClient
            .patch(ticketId)
            .set(updates)
            .commit()

        // Kunde über die Support-Antwort benachrichtigen
        try {
            await sendTicketReplyNotification({
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                message,
                recipientName: ticket.createdByUser.name,
                recipientEmail: ticket.createdByUser.email
            })
        } catch (error) {
            console.error('Fehler beim Senden der Support-Antwort-Benachrichtigung:', error)
            // Wir werfen hier keinen Fehler, um den Prozess nicht zu unterbrechen
        }

        // Activity-Log erstellen
        await writeClient.create({
            _type: 'activityLog',
            activityType: 'ticket.support_reply',
            details: `Support-Antwort zu Ticket ${ticket.ticketNumber} hinzugefügt`,
            timestamp: new Date().toISOString(),
            userId: user._id,
            userEmail: user.email
        })

        return NextResponse.json({ ticket: updatedTicket, success: true })
    } catch (error) {
        console.error('Fehler beim Senden der Support-Antwort:', error)
        return NextResponse.json(
            { error: 'Fehler beim Senden der Support-Antwort' },
            { status: 500 }
        )
    }
}