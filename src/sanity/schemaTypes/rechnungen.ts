// src/sanity/schemaTypes/rechnungen.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from '@sanity/types'

export const rechnungenSchema = defineType({
    name: 'rechnungen',
    title: 'Rechnungen',
    type: 'document',
    fields: [
        defineField({
            name: 'rechnungsnummer',
            title: 'Rechnungsnummer',
            type: 'number',
            validation: Rule => Rule
                .required()
                .integer()
                .positive()
                .custom<number>((rechnungsnummer, context: ValidationContext) => {
                    if (!rechnungsnummer) return true

                    const client = context.getClient({apiVersion: '2024-01-29'})
                    return client.fetch(`
                        *[_type == "rechnungen" && rechnungsnummer == $nummer && _id != $id][0]
                    `, {
                        nummer: rechnungsnummer,
                        id: context.document?._id
                    }).then(existingInvoice => {
                        return existingInvoice ? 'Diese Rechnungsnummer existiert bereits' : true
                    })
                }),
            description: 'Eindeutige Rechnungsnummer'
        }),
        defineField({
            name: 'rechnungsdatum',
            title: 'Rechnungsdatum',
            type: 'date',
            validation: Rule => Rule.required(),
            options: {
                dateFormat: 'DD.MM.YYYY'
            }
        }),
        defineField({
            name: 'projekt',
            title: 'Projekt',
            type: 'reference',
            to: [{type: 'projekte'}],
            validation: Rule => Rule.required(),
            options: {
                disableNew: true // Verhindert das Erstellen neuer Projekte aus dem Rechnungs-Dialog
            }
        }),
        defineField({
            name: 'rechnungsPDF',
            title: 'Rechnung als PDF',
            type: 'file',
            validation: Rule => Rule.required(),
            options: {
                accept: '.pdf'
            }
        }),
        defineField({
            name: 'betrag',
            title: 'Rechnungsbetrag',
            type: 'number',
            validation: Rule => Rule
                .required()
                .precision(2)
                .positive(),
            description: 'Gesamtbetrag der Rechnung in Euro'
        }),
        defineField({
            name: 'bezahlt',
            title: 'Bezahlt',
            type: 'boolean',
            initialValue: false
        }),
        defineField({
            name: 'zahlungsdatum',
            title: 'Zahlungsdatum',
            type: 'date',
            hidden: ({document}) => !document?.bezahlt,
            validation: Rule => Rule.custom((zahlungsdatum: string | undefined, context: ValidationContext) => {
                const doc = context.document as { bezahlt?: boolean; rechnungsdatum?: string } | undefined

                if (doc?.bezahlt && !zahlungsdatum) {
                    return 'Bei bezahlten Rechnungen muss ein Zahlungsdatum angegeben werden'
                }

                if (zahlungsdatum && doc?.rechnungsdatum) {
                    const zahlungsDt = new Date(zahlungsdatum)
                    const rechnungsDt = new Date(doc.rechnungsdatum)

                    if (zahlungsDt < rechnungsDt) {
                        return 'Das Zahlungsdatum kann nicht vor dem Rechnungsdatum liegen'
                    }
                }

                return true
            })
        }),
        defineField({
            name: 'notizen',
            title: 'Notizen',
            type: 'text',
            rows: 3
        }),
        defineField({
            name: 'createdAt',
            title: 'Erstellt am',
            type: 'datetime',
            readOnly: true,
            initialValue: () => new Date().toISOString()
        }),
        defineField({
            name: 'updatedAt',
            title: 'Aktualisiert am',
            type: 'datetime',
            readOnly: true,
            initialValue: () => new Date().toISOString()
        })
    ],
    preview: {
        select: {
            title: 'rechnungsnummer',
            date: 'rechnungsdatum',
            project: 'projekt.titel',
            betrag: 'betrag',
            bezahlt: 'bezahlt'
        },
        prepare: ({title, date, project, betrag, bezahlt}) => {
            const formatDate = (dateString: string) => {
                return new Date(dateString).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            }

            return {
                title: `Rechnung ${title}`,
                subtitle: `${project} - ${formatDate(date)} - ${betrag?.toFixed(2)}€ ${bezahlt ? '✓' : ''}`,
                media: bezahlt ? '✅' : '📄'
            }
        }
    },
    orderings: [
        {
            title: 'Rechnungsnummer',
            name: 'rechnungsnummerDesc',
            by: [
                {field: 'rechnungsnummer', direction: 'desc'}
            ]
        },
        {
            title: 'Rechnungsdatum',
            name: 'rechnungsdatumDesc',
            by: [
                {field: 'rechnungsdatum', direction: 'desc'}
            ]
        }
    ]
})