// src/components/support/FAQSection.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// FAQ-Daten - Später können diese aus Sanity geladen werden
const faqs = [
    {
        category: 'Allgemein',
        items: [
            {
                question: 'Was ist ein KI-Chatbot?',
                answer: 'Ein KI-Chatbot ist ein Programm, das mithilfe künstlicher Intelligenz natürliche Gespräche mit Menschen führen kann. Er kann auf Websites oder in Apps integriert werden, um Kundenanfragen zu beantworten, Informationen bereitzustellen oder bei Aufgaben zu unterstützen.'
            },
            {
                question: 'Wie funktioniert das AI Spend-Limit?',
                answer: 'Das AI Spend-Limit begrenzt die monatlichen Kosten für die KI-Nutzung Ihres Chatbots. In Ihrem Vertrag ist ein bestimmtes Limit festgelegt. Bei Erreichen von 80% des Limits werden Sie benachrichtigt. Sie können das Limit jederzeit anpassen oder erhöhen.'
            },
            {
                question: 'Kann ich meinen Chatbot anpassen?',
                answer: 'Ja, Sie können das Erscheinungsbild und Verhalten Ihres Chatbots anpassen. Farben, Schriftarten und Positionierung sind über CSS anpassbar. Für inhaltliche Anpassungen kontaktieren Sie bitte den Support.'
            }
        ]
    },
    {
        category: 'Integration & Technik',
        items: [
            {
                question: 'Wie integriere ich den Chatbot auf meiner Website?',
                answer: 'Die Integration erfolgt durch Einfügen eines JavaScript-Snippets in Ihren Website-Code. Detaillierte Anweisungen finden Sie im Bereich "Dokumentation" auf dieser Seite.'
            },
            {
                question: 'Funktioniert der Chatbot auf mobilen Geräten?',
                answer: 'Ja, der Chatbot ist vollständig responsive und funktioniert auf allen Geräten, einschließlich Smartphones und Tablets.'
            },
            {
                question: 'Kann ich den Chatbot in meine WordPress-Seite integrieren?',
                answer: 'Ja, Sie können den Chatbot in WordPress integrieren, indem Sie das bereitgestellte JavaScript-Snippet in einem HTML-Widget oder über ein Plugin wie "Header and Footer Scripts" einfügen.'
            }
        ]
    },
    {
        category: 'Datenschutz & Sicherheit',
        items: [
            {
                question: 'Wie steht es um den Datenschutz?',
                answer: 'Alle Daten werden gemäß DSGVO behandelt. Die Chatverläufe werden verschlüsselt gespeichert und nur zur Verbesserung des Services genutzt. Details finden Sie in der Datenschutzerklärung, die Ihnen bei Vertragsabschluss zur Verfügung gestellt wurde.'
            },
            {
                question: 'Werden die Chatverläufe gespeichert?',
                answer: 'Ja, Chatverläufe werden für einen Zeitraum von 30 Tagen gespeichert, um die Qualität des Services zu verbessern und auf Anfragen reagieren zu können. Sie können im Dashboard auf diese Verläufe zugreifen.'
            }
        ]
    },
    {
        category: 'Abrechnung & Vertrag',
        items: [
            {
                question: 'Wie werden die Kosten berechnet?',
                answer: 'Die Kosten setzen sich aus der monatlichen Grundgebühr gemäß Ihrem Vertragsmodell sowie eventuellen zusätzlichen AI-Kosten zusammen, wenn Ihr AI Spend-Limit überschritten wird.'
            },
            {
                question: 'Kann ich mein Vertragsmodell ändern?',
                answer: 'Ja, eine Änderung des Vertragsmodells ist jederzeit zum Beginn des nächsten Abrechnungszeitraums möglich. Kontaktieren Sie hierfür bitte den Support.'
            }
        ]
    }
]

export function FAQSection() {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    // Filtere FAQs basierend auf der Suchanfrage
    const filteredFaqs = faqs.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0)

    const toggleItem = (question: string) => {
        if (expandedItem === question) {
            setExpandedItem(null)
        } else {
            setExpandedItem(question)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Häufig gestellte Fragen</CardTitle>
                    <CardDescription>
                        Hier finden Sie Antworten auf die häufigsten Fragen zu Ihrem Chatbot.
                    </CardDescription>
                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            type="search"
                            placeholder="Nach Fragen oder Stichwörtern suchen..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Keine Ergebnisse gefunden. Bitte versuchen Sie eine andere Suchanfrage.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredFaqs.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="space-y-4">
                                    <h3 className="font-medium text-lg">{category.category}</h3>
                                    <div className="space-y-2">
                                        {category.items.map((item, itemIndex) => (
                                            <div
                                                key={itemIndex}
                                                className="border rounded-lg overflow-hidden"
                                            >
                                                <button
                                                    className="w-full px-4 py-3 text-left font-medium flex justify-between items-center hover:bg-slate-50"
                                                    onClick={() => toggleItem(item.question)}
                                                >
                                                    {item.question}
                                                    <span className="text-slate-400">
                                                        {expandedItem === item.question ? "−" : "+"}
                                                    </span>
                                                </button>

                                                {expandedItem === item.question && (
                                                    <div className="px-4 py-3 bg-slate-50 border-t">
                                                        <p className="text-slate-700">{item.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Können wir Ihnen noch helfen?</CardTitle>
                    <CardDescription>
                        Wenn Sie weitere Fragen haben, kontaktieren Sie uns gerne.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button outline className="flex-1">Support-Ticket erstellen</Button>
                    <Button color="blue" className="flex-1">Direkter Kontakt</Button>
                </CardContent>
            </Card>
        </div>
    )
}