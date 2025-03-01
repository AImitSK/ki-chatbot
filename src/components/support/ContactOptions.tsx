// src/components/support/ContactOptions.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import {
    MailIcon,
    PhoneIcon,
    MessageSquareIcon,
    ClockIcon,
    MapPinIcon,
    GlobeIcon,
    CalendarIcon
} from 'lucide-react'

export function ContactOptions() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Kontaktmöglichkeiten</CardTitle>
                    <CardDescription>
                        Wählen Sie Ihren bevorzugten Weg, um mit uns in Kontakt zu treten
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-2">
                                <MailIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-base">E-Mail Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">
                                Bevorzugt für komplexere Anfragen und Problembeschreibungen
                            </p>
                            <p className="font-medium text-sm mb-1">E-Mail:</p>
                            <p className="text-blue-600 mb-4">support@sk-online-marketing.de</p>
                            <p className="text-xs text-slate-500 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Reaktionszeit: 24 Stunden
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-2">
                                <PhoneIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-base">Telefon Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">
                                Für dringende Anliegen und direkte Unterstützung
                            </p>
                            <p className="font-medium text-sm mb-1">Telefon:</p>
                            <p className="text-blue-600 mb-4">+49 (0) 123 456 789</p>
                            <p className="text-xs text-slate-500 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Mo-Fr, 9:00 - 17:00 Uhr
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-2">
                                <MessageSquareIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-base">Live-Chat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">
                                Schnelle Hilfe bei einfachen Fragen und Problemen
                            </p>
                            <Button color="blue" className="w-full mb-4">
                                Chat starten
                            </Button>
                            <p className="text-xs text-slate-500 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Verfügbar: Mo-Fr, 10:00 - 16:00 Uhr
                            </p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Unternehmensinformationen</CardTitle>
                    <CardDescription>
                        SK Online Marketing GmbH
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPinIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium mb-1">Adresse</h3>
                                <p className="text-sm text-slate-500">
                                    Musterstraße 123<br />
                                    12345 Musterstadt<br />
                                    Deutschland
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <ClockIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium mb-1">Geschäftszeiten</h3>
                                <p className="text-sm text-slate-500">
                                    Montag - Freitag: 9:00 - 17:00 Uhr<br />
                                    Samstag & Sonntag: Geschlossen
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <GlobeIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium mb-1">Website</h3>
                                <a href="https://www.sk-online-marketing.de" className="text-sm text-blue-600 hover:underline">
                                    www.sk-online-marketing.de
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium mb-3">Termin vereinbaren</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Für komplexere Anliegen können Sie einen persönlichen Beratungstermin mit unseren Experten vereinbaren.
                        </p>
                        <Button color="blue" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Termin buchen
                        </Button>
                    </div>
                </CardContent>
            </Card>


        </div>
    )
}