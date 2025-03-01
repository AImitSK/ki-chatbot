// src/sanity/schemaTypes/supportTicket.ts
import { defineType, defineField } from 'sanity'

// Status-Map für die Preview-Funktion definieren
const statusMap: Record<string, string> = {
    'open': '🔴 Offen',
    'in_progress': '🟠 In Bearbeitung',
    'pending_customer': '🟡 Warte auf Kunde',
    'closed': '🟢 Abgeschlossen'
}

export const supportTicketSchema = defineType({
    name: 'supportTicket',
    title: 'Support Tickets',
    type: 'document',
    fields: [
        defineField({
            name: 'ticketNumber',
            title: 'Ticket Nummer',
            type: 'string',
            readOnly: true,
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'subject',
            title: 'Betreff',
            type: 'string',
            validation: Rule => Rule.required().min(3).max(100)
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Offen', value: 'open' },
                    { title: 'In Bearbeitung', value: 'in_progress' },
                    { title: 'Wartend auf Kunde', value: 'pending_customer' },
                    { title: 'Abgeschlossen', value: 'closed' }
                ],
                layout: 'radio'
            },
            initialValue: 'open',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'priority',
            title: 'Priorität',
            type: 'string',
            options: {
                list: [
                    { title: 'Niedrig', value: 'low' },
                    { title: 'Mittel', value: 'medium' },
                    { title: 'Hoch', value: 'high' }
                ],
                layout: 'radio'
            },
            initialValue: 'medium',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'createdBy',
            title: 'Erstellt von',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'assignedTo',
            title: 'Zugewiesen an',
            type: 'reference',
            to: [{ type: 'user' }],
            description: 'Support-Mitarbeiter, der dieses Ticket bearbeitet'
        }),
        defineField({
            name: 'projekt',
            title: 'Projekt',
            type: 'reference',
            to: [{ type: 'projekte' }],
            description: 'Projekt, zu dem dieses Ticket gehört (optional)'
        }),
        defineField({
            name: 'messages',
            title: 'Nachrichten',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'sender',
                            title: 'Absender',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Kunde', value: 'user' },
                                    { title: 'Support', value: 'support' }
                                ]
                            },
                            validation: Rule => Rule.required()
                        }),
                        defineField({
                            name: 'message',
                            title: 'Nachricht',
                            type: 'text',
                            rows: 5,
                            validation: Rule => Rule.required()
                        }),
                        defineField({
                            name: 'timestamp',
                            title: 'Zeitstempel',
                            type: 'datetime',
                            initialValue: () => new Date().toISOString(),
                            validation: Rule => Rule.required()
                        }),
                        defineField({
                            name: 'senderName',
                            title: 'Absendername',
                            type: 'string',
                            description: 'Name des Absenders (für die Anzeige)'
                        }),
                        defineField({
                            name: 'senderEmail',
                            title: 'Absender-Email',
                            type: 'string',
                            description: 'E-Mail des Absenders (für Antworten)'
                        }),
                        defineField({
                            name: 'attachments',
                            title: 'Anhänge',
                            type: 'array',
                            of: [
                                {
                                    type: 'file',
                                    options: {
                                        accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'
                                    }
                                }
                            ]
                        })
                    ],
                    preview: {
                        select: {
                            title: 'sender',
                            subtitle: 'timestamp',
                            message: 'message'
                        },
                        prepare: ({ title, subtitle, message }) => ({
                            title: title === 'user' ? 'Kunde' : 'Support',
                            subtitle: new Date(subtitle).toLocaleString('de-DE'),
                            description: message && message.length > 50 ? message.substring(0, 50) + '...' : message
                        })
                    }
                }
            ]
        }),
        defineField({
            name: 'createdAt',
            title: 'Erstellt am',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'updatedAt',
            title: 'Aktualisiert am',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'closedAt',
            title: 'Geschlossen am',
            type: 'datetime',
            hidden: ({ document }) => document?.status !== 'closed'
        }),
        defineField({
            name: 'internalNotes',
            title: 'Interne Notizen',
            type: 'text',
            rows: 3,
            description: 'Notizen für das Support-Team (nicht sichtbar für den Kunden)'
        })
    ],
    preview: {
        select: {
            title: 'subject',
            subtitle: 'status',
            ticketNumber: 'ticketNumber',
            createdBy: 'createdBy.name',
            createdAt: 'createdAt'
        },
        prepare: ({ title, subtitle, ticketNumber, createdBy, createdAt }) => {
            // Typensichere Version mit explizitem Casting
            const status = subtitle as keyof typeof statusMap;
            const statusText = status in statusMap ? statusMap[status] : subtitle;

            return {
                title: `${ticketNumber}: ${title || 'Kein Betreff'}`,
                subtitle: `${statusText} - Von: ${createdBy || 'Unbekannt'} - ${createdAt ? new Date(createdAt).toLocaleString('de-DE') : 'Kein Datum'}`
            }
        }
    },
    orderings: [
        {
            title: 'Neueste zuerst',
            name: 'createdAtDesc',
            by: [
                {field: 'createdAt', direction: 'desc'}
            ]
        },
        {
            title: 'Status',
            name: 'statusAsc',
            by: [
                {field: 'status', direction: 'asc'},
                {field: 'createdAt', direction: 'desc'}
            ]
        },
        {
            title: 'Priorität',
            name: 'priorityDesc',
            by: [
                {field: 'priority', direction: 'desc'},
                {field: 'createdAt', direction: 'desc'}
            ]
        }
    ]
})