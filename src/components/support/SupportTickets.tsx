// src/components/support/SupportTickets.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TicketIcon, ClockIcon, CheckCircleIcon, SendIcon, InfoIcon, FileIcon, LoaderIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/useToast'

// Typdefinitionen
interface Ticket {
    _id: string;
    ticketNumber: string;
    subject: string;
    status: 'open' | 'in_progress' | 'pending_customer' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    project?: string;
    messages: TicketMessage[];
}

interface TicketMessage {
    sender: 'user' | 'support';
    message: string;
    timestamp: string;
    senderName?: string;
    attachments?: {
        url: string;
        filename: string;
    }[];
}

interface TicketDetailResponse {
    ticket: Ticket;
    success: boolean;
}

interface TicketsResponse {
    tickets: Ticket[];
}

// Benutzerdefinierte minimale UI-Komponenten
function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
            {children}
        </label>
    );
}

function Badge({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
            {children}
        </span>
    );
}

// Formatierungsfunktionen
function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Status-Badge Styling
function getStatusBadge(status: string) {
    switch (status) {
        case 'open':
            return <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Offen</Badge>
        case 'in_progress':
            return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">In Bearbeitung</Badge>
        case 'pending_customer':
            return <Badge className="bg-purple-50 text-purple-700 border border-purple-200">Wartend</Badge>
        case 'closed':
            return <Badge className="bg-green-50 text-green-700 border border-green-200">Abgeschlossen</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

// Prioritäts-Badge Styling
function getPriorityBadge(priority: string) {
    switch (priority) {
        case 'high':
            return <Badge className="bg-red-50 text-red-700 border border-red-200">Hoch</Badge>
        case 'medium':
            return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">Mittel</Badge>
        case 'low':
            return <Badge className="bg-green-50 text-green-700 border border-green-200">Niedrig</Badge>
        default:
            return <Badge>{priority}</Badge>
    }
}

// Tab content component
function TabContent({ value, children, label }: { value: string, label?: string, children: React.ReactNode }) {
    return <div>{children}</div>;
}

// Tabbed interface
function SimpleTabs({ children, defaultTab }: { children: React.ReactNode, defaultTab: string }) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Wir extrahieren nur die Kinder mit dem activeTab-Wert
    const activeContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.props.value === activeTab
    );

    // Extrahiere alle Tab-Trigger für die Navigation
    const tabTriggers = React.Children.toArray(children).map(child => {
        if (React.isValidElement(child) && child.props.label) {
            return (
                <button
                    key={child.props.value}
                    className={`px-4 py-2 rounded-md ${activeTab === child.props.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab(child.props.value)}
                >
                    {child.props.label}
                </button>
            );
        }
        return null;
    });

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
                {tabTriggers}
            </div>
            {activeContent}
        </div>
    );
}

// Hauptkomponente
export function SupportTickets() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('new');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formulardaten für neues Ticket
    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // Tickets laden
    useEffect(() => {
        if (session) {
            fetchTickets();
        }
    }, [session]);

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/support/tickets');

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Tickets');
            }

            const data: TicketsResponse = await response.json();
            setTickets(data.tickets || []);
        } catch (error) {
            console.error('Fehler beim Laden der Tickets:', error);
            toast({
                title: 'Fehler',
                description: 'Die Tickets konnten nicht geladen werden.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTicketDetails = async (ticketId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/support/tickets/${ticketId}`);

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Ticket-Details');
            }

            const data: TicketDetailResponse = await response.json();
            if (data.success && data.ticket) {
                setSelectedTicket(data.ticket);
                setActiveTab('details');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Ticket-Details:', error);
            toast({
                title: 'Fehler',
                description: 'Die Ticket-Details konnten nicht geladen werden.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitNewTicket = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTicket.subject.trim() || !newTicket.message.trim()) {
            toast({
                title: 'Fehler',
                description: 'Bitte füllen Sie alle Pflichtfelder aus.',
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: newTicket.subject,
                    message: newTicket.message,
                    priority: newTicket.priority
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Tickets');
            }

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Erfolg',
                    description: 'Ihr Ticket wurde erfolgreich erstellt. Wir werden uns so schnell wie möglich bei Ihnen melden.',
                    variant: 'default'
                });

                // Formular zurücksetzen
                setNewTicket({
                    subject: '',
                    message: '',
                    priority: 'medium'
                });

                // Tickets neu laden und zur Ticket-Liste wechseln
                await fetchTickets();
                setActiveTab('history');
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Tickets:', error);
            toast({
                title: 'Fehler',
                description: 'Das Ticket konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/support/tickets/${selectedTicket._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: replyText
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Senden der Antwort');
            }

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Erfolg',
                    description: 'Ihre Antwort wurde erfolgreich gesendet.',
                    variant: 'default'
                });

                setReplyText('');

                // Ticket-Details aktualisieren
                await fetchTicketDetails(selectedTicket._id);
            }
        } catch (error) {
            console.error('Fehler beim Senden der Antwort:', error);
            toast({
                title: 'Fehler',
                description: 'Die Antwort konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/support/tickets/${selectedTicket._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'closed'
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Schließen des Tickets');
            }

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Erfolg',
                    description: 'Das Ticket wurde erfolgreich geschlossen.',
                    variant: 'default'
                });

                // Ticket-Details aktualisieren
                await fetchTicketDetails(selectedTicket._id);
            }
        } catch (error) {
            console.error('Fehler beim Schließen des Tickets:', error);
            toast({
                title: 'Fehler',
                description: 'Das Ticket konnte nicht geschlossen werden. Bitte versuchen Sie es später erneut.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <SimpleTabs defaultTab="new">
                <TabContent value="new" label="Neues Ticket">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TicketIcon className="h-5 w-5" />
                                Neues Support-Ticket erstellen
                            </CardTitle>
                            <CardDescription>
                                Beschreiben Sie Ihr Anliegen, und unser Support-Team wird sich innerhalb von 24 Stunden bei Ihnen melden.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmitNewTicket}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Betreff</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Kurzer Betreff Ihres Anliegens"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priorität</Label>
                                    <select
                                        id="priority"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as 'low' | 'medium' | 'high'})}
                                    >
                                        <option value="low">Niedrig - Allgemeine Frage</option>
                                        <option value="medium">Mittel - Kleines Problem</option>
                                        <option value="high">Hoch - Kritisches Problem</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Beschreibung</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                                        rows={6}
                                        value={newTicket.message}
                                        onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            Wird gesendet...
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon className="mr-2 h-4 w-4" />
                                            Ticket absenden
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabContent>

                <TabContent value="history" label="Ticket-Verlauf">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ihre Support-Tickets</CardTitle>
                            <CardDescription>
                                Übersicht aller Ihrer bisherigen Support-Anfragen
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-6">
                                    <LoaderIcon className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-6">
                                    <InfoIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-slate-500">Sie haben noch keine Support-Tickets erstellt.</p>
                                    <Button
                                        onClick={() => setActiveTab('new')}
                                        className="mt-4"
                                    >
                                        Erstes Ticket erstellen
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket._id}
                                            className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => fetchTicketDetails(ticket._id)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                <h3 className="font-medium">{ticket.subject}</h3>
                                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500 gap-4">
                                                <span className="flex items-center">
                                                    <TicketIcon className="mr-1 h-3 w-3" />
                                                    {ticket.ticketNumber}
                                                </span>
                                                <span className="flex items-center">
                                                    <ClockIcon className="mr-1 h-3 w-3" />
                                                    {formatDateTime(ticket.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={fetchTickets}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                        Wird aktualisiert...
                                    </>
                                ) : (
                                    <>
                                        <RefreshIcon className="mr-2 h-4 w-4" />
                                        Aktualisieren
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabContent>

                {selectedTicket && (
                    <TabContent value="details" label={`Ticket #${selectedTicket.ticketNumber}`}>
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2">
                                        <TicketIcon className="h-5 w-5" />
                                        <span>{selectedTicket.subject}</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(selectedTicket.status)}
                                        {getPriorityBadge(selectedTicket.priority)}
                                    </div>
                                </div>
                                <CardDescription className="flex flex-col sm:flex-row gap-4">
                                    <span className="flex items-center">
                                        <TicketIcon className="mr-1 h-3 w-3" />
                                        Ticket #{selectedTicket.ticketNumber}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="mr-1 h-3 w-3" />
                                        Erstellt: {formatDateTime(selectedTicket.createdAt)}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="mr-1 h-3 w-3" />
                                        Letztes Update: {formatDateTime(selectedTicket.updatedAt)}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {selectedTicket.messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`rounded-lg p-3 max-w-[80%] ${
                                                    message.sender === 'user'
                                                        ? 'bg-blue-50 border border-blue-100'
                                                        : 'bg-slate-100 border border-slate-200'
                                                }`}
                                            >
                                                <div className="text-sm mb-1">
                                                    <span className="font-medium">
                                                        {message.sender === 'user' ? 'Sie' : 'Support-Team'}
                                                        {message.senderName && ` (${message.senderName})`}
                                                    </span>
                                                    <span className="text-slate-500 ml-2">
                                                        {formatDateTime(message.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="whitespace-pre-line">
                                                    {message.message}
                                                </div>

                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mt-2 border-t border-gray-200 pt-2">
                                                        <p className="text-xs text-slate-500 mb-1">Anhänge:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {message.attachments.map((attachment, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                                                >
                                                                    <FileIcon className="h-3 w-3" />
                                                                    {attachment.filename || `Anhang ${idx + 1}`}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedTicket.status !== 'closed' && (
                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium mb-2">Ihre Antwort</h3>
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Schreiben Sie Ihre Antwort..."
                                                rows={4}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim() || isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                        Wird gesendet...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SendIcon className="mr-2 h-4 w-4" />
                                                        Antwort senden
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {selectedTicket.status === 'closed' && (
                                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        <span>Dieses Ticket wurde abgeschlossen. Wenn Sie weitere Hilfe benötigen, erstellen Sie bitte ein neues Ticket.</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    onClick={() => {
                                        setActiveTab('history');
                                        setSelectedTicket(null);
                                    }}
                                >
                                    Zurück zur Übersicht
                                </Button>

                                {selectedTicket.status !== 'closed' && (
                                    <Button
                                        onClick={handleCloseTicket}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                Wird geschlossen...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="mr-2 h-4 w-4" />
                                                Als gelöst markieren
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </TabContent>
                )}
            </SimpleTabs>
        </div>
    );
}

// RefreshIcon Komponente, da sie in Lucide nicht explizit importiert wurde
function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    );
}