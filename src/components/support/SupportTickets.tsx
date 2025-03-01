// src/components/support/SupportTickets.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MailIcon, TicketIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SendIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

// Einfache Tabs-Implementierung
function SimpleTabs({ children, defaultTab }: { children: React.ReactNode, defaultTab: string }) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Wir extrahieren nur die Kinder mit dem activeTab-Wert
    const activeContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.props.value === activeTab
    );

    // Extrahiere alle Tab-Trigger für die Navigation
    const tabTriggers = React.Children.toArray(children).map(child => {
        if (React.isValidElement(child)) {
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

// Tab content component
function TabContent({ value, children }: { value: string, label?: string, children: React.ReactNode }) {
    return <div>{children}</div>;
}

// Beispieldaten für vergangene Tickets
const ticketHistory = [
    {
        id: 'TCK-2023-0012',
        subject: 'Probleme bei der Chatbot-Integration',
        status: 'closed',
        priority: 'medium',
        created: '2023-12-10T14:32:00',
        updated: '2023-12-12T09:15:00',
        messages: [
            {
                sender: 'user',
                message: 'Ich habe Probleme bei der Integration des Chatbots auf unserer neuen Landing Page. Der Bot wird nicht angezeigt.',
                timestamp: '2023-12-10T14:32:00'
            },
            {
                sender: 'support',
                message: 'Vielen Dank für Ihre Anfrage. Können Sie mir bitte mitteilen, welches CMS Sie verwenden und ob Sie das Script wie in der Dokumentation beschrieben eingebunden haben?',
                timestamp: '2023-12-10T15:45:00'
            },
            {
                sender: 'user',
                message: 'Wir verwenden WordPress mit Elementor. Ich habe das Script im Footer-Bereich eingefügt, wie in der Dokumentation beschrieben.',
                timestamp: '2023-12-11T10:23:00'
            },
            {
                sender: 'support',
                message: 'Vielen Dank für die Information. Das Problem könnte an einem Script-Blocker oder einem Konflikt mit anderen WordPress-Plugins liegen. Bitte versuchen Sie folgendes:\n\n1. Prüfen Sie die Browser-Konsole auf Fehlermeldungen\n2. Deaktivieren Sie temporär andere Plugins, um Konflikte auszuschließen\n3. Versuchen Sie die Integration über das "Header and Footer Scripts" Plugin\n\nBitte teilen Sie uns mit, ob einer dieser Schritte das Problem löst.',
                timestamp: '2023-12-11T11:17:00'
            },
            {
                sender: 'user',
                message: 'Vielen Dank für die Tipps! Es war tatsächlich ein Konflikt mit einem Caching-Plugin. Nach der Deaktivierung funktioniert der Chatbot einwandfrei.',
                timestamp: '2023-12-12T09:05:00'
            },
            {
                sender: 'support',
                message: 'Das freut mich zu hören! Falls Sie das Caching-Plugin weiterhin nutzen möchten, können Sie in den Einstellungen des Plugins bestimmte Scripts vom Caching ausschließen. Dafür fügen Sie einfach die Domain "cdn.botpress.cloud" zur Ausnahmeliste hinzu. Bei weiteren Fragen stehen wir Ihnen gerne zur Verfügung!',
                timestamp: '2023-12-12T09:15:00'
            }
        ]
    },
    {
        id: 'TCK-2024-0003',
        subject: 'Frage zum AI Spend-Limit',
        status: 'open',
        priority: 'low',
        created: '2024-01-15T10:42:00',
        updated: '2024-01-15T11:30:00',
        messages: [
            {
                sender: 'user',
                message: 'Guten Tag, ich habe eine Frage zu meinem AI Spend-Limit. Wie kann ich sehen, wie viel davon bereits verbraucht wurde?',
                timestamp: '2024-01-15T10:42:00'
            },
            {
                sender: 'support',
                message: 'Hallo! Vielen Dank für Ihre Anfrage. Sie können Ihren aktuellen AI Spend-Verbrauch im Dashboard unter dem Reiter "Statistiken" einsehen. Dort finden Sie ein Diagramm, das den monatlichen Verbrauch darstellt, sowie den aktuellen Stand in Relation zu Ihrem festgelegten Limit. Haben Sie diese Information gefunden oder benötigen Sie weitere Hilfe?',
                timestamp: '2024-01-15T11:30:00'
            }
        ]
    }
]

export function SupportTickets() {
    const [activeTab, setActiveTab] = useState('new')
    const [selectedTicket, setSelectedTicket] = useState<typeof ticketHistory[0] | null>(null)
    const [replyText, setReplyText] = useState('')

    // Formulardaten für neues Ticket
    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    })

    const handleSubmitNewTicket = (e: React.FormEvent) => {
        e.preventDefault()
        // Hier würde normalerweise der API-Call zum Erstellen eines neuen Tickets erfolgen
        alert('Ticket wurde erstellt! In einer realen Anwendung würde dies an einen Server gesendet werden.')
        setNewTicket({
            subject: '',
            message: '',
            priority: 'medium'
        })
    }

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedTicket) return

        // Hier würde normalerweise der API-Call zum Senden einer Antwort erfolgen
        alert('Antwort wurde gesendet! In einer realen Anwendung würde dies an einen Server gesendet werden.')
        setReplyText('')
    }

    // Hilfsfunktion zum Formatieren von Datum/Uhrzeit mit Zeit
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    // Status-Badge Styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Offen</Badge>
            case 'closed':
                return <Badge className="bg-green-50 text-green-700 border border-green-200">Abgeschlossen</Badge>
            case 'pending':
                return <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">Wartend</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    // Prioritäts-Badge Styling
    const getPriorityBadge = (priority: string) => {
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
                                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
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
                                <Button type="submit" color="blue" className="w-full sm:w-auto">
                                    <SendIcon className="mr-2 h-4 w-4" />
                                    Ticket absenden
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
                            {ticketHistory.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-slate-500">Sie haben noch keine Support-Tickets erstellt.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ticketHistory.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedTicket(ticket)
                                                setActiveTab('details')
                                            }}
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
                                                    {ticket.id}
                                                </span>
                                                <span className="flex items-center">
                                                    <ClockIcon className="mr-1 h-3 w-3" />
                                                    {formatDateTime(ticket.created)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabContent>

                {selectedTicket && (
                    <TabContent value="details" label={`Ticket #${selectedTicket.id}`}>
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
                                        Ticket #{selectedTicket.id}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="mr-1 h-3 w-3" />
                                        Erstellt: {formatDateTime(selectedTicket.created)}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="mr-1 h-3 w-3" />
                                        Letztes Update: {formatDateTime(selectedTicket.updated)}
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
                                                    </span>
                                                    <span className="text-slate-500 ml-2">
                                                        {formatDateTime(message.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="whitespace-pre-line">
                                                    {message.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedTicket.status === 'open' && (
                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium mb-2">Ihre Antwort</h3>
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Schreiben Sie Ihre Antwort..."
                                                rows={4}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <Button onClick={handleSendReply} color="blue" data-disabled={!replyText.trim()}>
                                                <SendIcon className="mr-2 h-4 w-4" />
                                                Antwort senden
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
                                    outline
                                    onClick={() => setActiveTab('history')}
                                >
                                    Zurück zur Übersicht
                                </Button>

                                {selectedTicket.status === 'open' && (
                                    <Button
                                        color="green"
                                    >
                                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                                        Als gelöst markieren
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </TabContent>
                )}
            </SimpleTabs>
        </div>
    )
}