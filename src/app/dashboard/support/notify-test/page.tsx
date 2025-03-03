'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';

// Definieren der Typen für die Ticket-Informationen
interface TicketRecipient {
    name: string;
    email: string;
}

interface TicketInfo {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    recipient: TicketRecipient;
}

export default function NotifyTestPage() {
    const [ticketId, setTicketId] = useState('');
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState('reply');
    const [isLoading, setIsLoading] = useState(false);
    const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
    const { toast } = useToast();

    const fetchTicketInfo = async () => {
        if (!ticketId) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/support/tickets/${ticketId}/notify`);

            if (!response.ok) {
                throw new Error('Konnte Ticket-Informationen nicht abrufen');
            }

            const data = await response.json();
            if (data.success && data.ticket) {
                setTicketInfo(data.ticket as TicketInfo);
                setMessage(`Dies ist eine Test-Benachrichtigung für Ticket ${data.ticket.ticketNumber}.`);
                toast({
                    description: `Ticket ${data.ticket.ticketNumber} wurde geladen`,
                    variant: 'default',
                });
            }
        } catch (error) {
            console.error('Fehler beim Laden des Tickets:', error);
            toast({
                description: 'Das Ticket konnte nicht geladen werden.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const sendNotification = async () => {
        if (!ticketId || !message) {
            toast({
                description: 'Bitte füllen Sie alle Felder aus.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/support/tickets/${ticketId}/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: notificationType,
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error('Benachrichtigung konnte nicht gesendet werden');
            }

            const data = await response.json();
            if (data.success) {
                toast({
                    description: 'Benachrichtigung wurde erfolgreich gesendet.',
                    variant: 'default',
                });
            }
        } catch (error) {
            console.error('Fehler beim Senden der Benachrichtigung:', error);
            toast({
                description: 'Die Benachrichtigung konnte nicht gesendet werden.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>E-Mail-Benachrichtigung Testseite</CardTitle>
                    <CardDescription>
                        Verwenden Sie dieses Formular, um E-Mail-Benachrichtigungen für Support-Tickets zu testen.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
                            Ticket-ID
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                id="ticketId"
                                placeholder="z.B. HuTjlDc1bMun6FXXaJzklZ"
                                value={ticketId}
                                onChange={(e) => setTicketId(e.target.value)}
                            />
                            <Button onClick={fetchTicketInfo} disabled={!ticketId || isLoading}>
                                {isLoading ? 'Laden...' : 'Ticket laden'}
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            Die Ticket-ID finden Sie in der URL oder in der Sanity Studio Oberfläche.
                        </p>
                    </div>

                    {ticketInfo && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                <h3 className="font-medium">Ticket-Informationen:</h3>
                                <p><strong>Ticket-Nummer:</strong> {ticketInfo.ticketNumber}</p>
                                <p><strong>Betreff:</strong> {ticketInfo.subject}</p>
                                <p><strong>Status:</strong> {ticketInfo.status}</p>
                                <p><strong>Empfänger:</strong> {ticketInfo.recipient.name} ({ticketInfo.recipient.email})</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700">
                                    Benachrichtigungstyp
                                </label>
                                <select
                                    id="notificationType"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={notificationType}
                                    onChange={(e) => setNotificationType(e.target.value)}
                                >
                                    <option value="reply">Antwort</option>
                                    <option value="closed">Ticket geschlossen</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Nachricht
                                </label>
                                <Textarea
                                    id="message"
                                    rows={5}
                                    placeholder="Nachricht für die Benachrichtigung"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-sm text-gray-500">
                                    Diese Nachricht wird in der E-Mail angezeigt.
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={sendNotification}
                        disabled={!ticketId || !message || isLoading || !ticketInfo}
                        className="w-full"
                    >
                        {isLoading ? 'Senden...' : 'Benachrichtigung senden'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hilfe</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-2">
                        Diese Seite hilft Ihnen, E-Mail-Benachrichtigungen für Support-Tickets zu testen. Sie können:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Eine Antwort-Benachrichtigung simulieren</li>
                        <li>Eine Benachrichtigung über ein geschlossenes Ticket simulieren</li>
                    </ul>
                    <p className="mt-4">
                        Sie benötigen die ID eines existierenden Tickets, das Sie in Sanity Studio finden können.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}