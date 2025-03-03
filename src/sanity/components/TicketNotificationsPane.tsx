// src/sanity/components/TicketNotificationsPane.tsx
import React, { useState } from 'react'
import { Stack, Card, Button, Text, Flex, Spinner, Box, TextArea } from '@sanity/ui'
import { CloseIcon } from '@sanity/icons'

interface TicketNotificationsPaneProps {
    document: {
        displayed: {
            _id: string;
            ticketNumber: string;
            status: string;
        };
    };
}

export const TicketNotificationsPane = ({ document }: TicketNotificationsPaneProps) => {
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<{success: boolean; message: string} | null>(null)
    const [customMessage, setCustomMessage] = useState('')

    // Aktuelle Dokument-Daten abrufen
    const documentId = document.displayed._id
    const ticketStatus = document.displayed.status
    const ticketNumber = document.displayed.ticketNumber

    // Benachrichtigung senden
    const handleSendNotification = async (type: 'reply' | 'closed') => {
        try {
            setIsSending(true)
            setResult(null)

            // API-Endpunkt aufrufen
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/support/tickets/${documentId}/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    message: customMessage ||
                        (type === 'reply'
                            ? "Eine neue Antwort wurde zu Ihrem Ticket hinzugefügt."
                            : `Ihr Ticket #${ticketNumber} wurde geschlossen.`)
                }),
            })

            if (response.ok) {
                setResult({
                    success: true,
                    message: `Benachrichtigung vom Typ "${type}" erfolgreich gesendet`
                })
                setCustomMessage('') // Nachricht zurücksetzen nach erfolgreicher Sendung
            } else {
                const errorData = await response.json()
                setResult({
                    success: false,
                    message: errorData.error || 'Ein Fehler ist aufgetreten'
                })
            }
        } catch (error) {
            console.error('Fehler beim Senden der Benachrichtigung:', error)
            setResult({
                success: false,
                message: 'Ein unerwarteter Fehler ist aufgetreten'
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Card padding={4} radius={2} shadow={1}>
            <Stack space={4}>
                <Text weight="semibold" size={2}>Ticket-Benachrichtigungen</Text>

                <Card padding={3} radius={2} tone="caution">
                    <Text size={1}>
                        Hier können Sie manuell E-Mail-Benachrichtigungen an den Kunden senden.
                        Beachten Sie, dass dies zusätzlich zu automatischen Benachrichtigungen ist.
                    </Text>
                </Card>

                <Box>
                    <Text weight="medium" size={1} style={{marginBottom: '8px'}}>
                        Benutzerdefinierte Nachricht (optional):
                    </Text>
                    <TextArea
                        value={customMessage}
                        onChange={event => setCustomMessage(event.currentTarget.value)}
                        placeholder="Ihre benutzerdefinierte Nachricht für die E-Mail-Benachrichtigung..."
                        rows={3}
                    />
                </Box>

                <Flex gap={3}>
                    <Button
                        text="Antwort-Benachrichtigung senden"
                        tone="primary"
                        onClick={() => handleSendNotification('reply')}
                        disabled={isSending || !documentId}
                        style={{flex: 1}}
                    />

                    <Button
                        text="Ticket-Schließung benachrichtigen"
                        tone="caution"
                        icon={CloseIcon}
                        onClick={() => handleSendNotification('closed')}
                        disabled={isSending || !documentId || ticketStatus === 'closed'}
                        style={{flex: 1}}
                    />
                </Flex>

                {isSending && (
                    <Flex align="center" justify="center" padding={3}>
                        <Spinner />
                        <Box marginLeft={3}>
                            <Text>Benachrichtigung wird gesendet...</Text>
                        </Box>
                    </Flex>
                )}

                {result && (
                    <Card
                        tone={result.success ? 'positive' : 'critical'}
                        padding={3}
                        radius={2}
                    >
                        <Text>{result.message}</Text>
                    </Card>
                )}

                {ticketStatus === 'closed' && (
                    <Card tone="caution" padding={3} radius={2}>
                        <Text>Dieses Ticket ist bereits geschlossen. Sie können trotzdem Antwort-Benachrichtigungen senden.</Text>
                    </Card>
                )}
            </Stack>
        </Card>
    )
}