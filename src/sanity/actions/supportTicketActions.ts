// src/sanity/actions/supportTicketActions.ts
import { CheckmarkCircleIcon } from '@sanity/icons'

interface TicketDocument {
    _id: string;
    _type: string;
    status: string;
    messages: any[];
    ticketNumber: string;
}

export const supportTicketActions = (context: any) => {
    // Nur für Support-Tickets anzeigen
    if (context.schemaType !== 'supportTicket') {
        return []
    }

    // Aktion: Antwort senden
    const sendReplyAction = {
        label: 'Antwort-Benachrichtigung senden',
        onHandle: async (params: any) => {
            const { toast } = params
            const { draft, published, client } = context

            try {
                // Das aktuelle Dokument verwenden (entweder der Draft oder das veröffentlichte Dokument)
                const document = draft || published as TicketDocument

                if (!document || document._type !== 'supportTicket') {
                    toast.push({
                        status: 'error',
                        title: 'Ungültiges Dokument'
                    })
                    return
                }

                // Optional: Die letzte Support-Nachricht finden
                const lastSupportMessage = [...document.messages]
                    .reverse()
                    .find(msg => msg.sender === 'support')

                const messageContent = lastSupportMessage
                    ? lastSupportMessage.message
                    : 'Eine neue Antwort wurde zu Ihrem Ticket hinzugefügt.'

                // API-Endpunkt aufrufen, um Benachrichtigung zu senden
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/support/tickets/${document._id}/notify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'reply',
                        message: messageContent
                    }),
                })

                if (response.ok) {
                    toast.push({
                        status: 'success',
                        title: 'Benachrichtigung gesendet'
                    })
                } else {
                    const errorData = await response.json()
                    toast.push({
                        status: 'error',
                        title: 'Fehler beim Senden der Benachrichtigung',
                        description: errorData.error || 'Unbekannter Fehler'
                    })
                }
            } catch (error) {
                console.error('Fehler:', error)
                toast.push({
                    status: 'error',
                    title: 'Fehler beim Senden der Benachrichtigung'
                })
            }
        }
    }

    // Aktion: Ticket schließen und Benachrichtigung senden
    const closeTicketAction = {
        label: 'Ticket schließen mit Benachrichtigung',
        icon: CheckmarkCircleIcon,
        onHandle: async (params: any) => {
            const { toast } = params
            const { draft, published, client } = context

            try {
                // Das aktuelle Dokument verwenden
                const document = draft || published as TicketDocument

                if (!document || document._type !== 'supportTicket') {
                    toast.push({
                        status: 'error',
                        title: 'Ungültiges Dokument'
                    })
                    return
                }

                // Nur ausführen, wenn das Ticket nicht bereits geschlossen ist
                if (document.status === 'closed') {
                    toast.push({
                        status: 'warning',
                        title: 'Ticket ist bereits geschlossen'
                    })
                    return
                }

                // 1. Ticket in Sanity schließen
                await client
                    .patch(document._id)
                    .set({
                        status: 'closed',
                        closedAt: new Date().toISOString()
                    })
                    .commit()

                // 2. Benachrichtigung senden
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/support/tickets/${document._id}/notify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'closed',
                        message: `Das Ticket #${document.ticketNumber} wurde geschlossen.`
                    }),
                })

                if (response.ok) {
                    toast.push({
                        status: 'success',
                        title: 'Ticket geschlossen und Benachrichtigung gesendet'
                    })
                } else {
                    const errorData = await response.json()
                    toast.push({
                        status: 'warning',
                        title: 'Ticket geschlossen, aber Benachrichtigung fehlgeschlagen',
                        description: errorData.error || 'Unbekannter Fehler'
                    })
                }
            } catch (error) {
                console.error('Fehler:', error)
                toast.push({
                    status: 'error',
                    title: 'Fehler beim Schließen des Tickets'
                })
            }
        }
    }

    return [sendReplyAction, closeTicketAction]
}