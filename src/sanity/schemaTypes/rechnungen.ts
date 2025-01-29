// src/sanity/schemaTypes/rechnungen.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext, SanityDocument } from 'sanity'

interface RechnungDocument extends SanityDocument {
    _type: 'rechnungen'
    rechnungsnummer?: number
}

export const rechnungenSchema = defineType({
    name: 'rechnungen',
    title: 'Rechnungen',
    type: 'document',
    fields: [
        defineField({
            name: 'rechnungsnummer',
            title: 'Rechnungsnummer',
            type: 'number',
            validation: Rule => Rule.required().positive().integer(),
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
            validation: Rule => Rule.required().positive(),
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
            hidden: ({document}) => !document?.bezahlt
        }),
        defineField({
            name: 'notizen',
            title: 'Notizen',
            type: 'text',
            rows: 3
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
    ],
    // Eindeutige Rechnungsnummer sicherstellen
    validation: Rule => Rule.custom(async (doc: SanityDocument | undefined, context: ValidationContext) => {
        if (!doc || !doc._type || doc._type !== 'rechnungen') return true

        const value = doc as RechnungDocument
        if (!value.rechnungsnummer) return true

        const client = context.getClient({apiVersion: '2024-01-29'})
        const existingInvoice = await client.fetch(`
     *[_type == "rechnungen" && rechnungsnummer == $nummer && _id != $id][0]
   `, {
            nummer: value.rechnungsnummer,
            id: value._id
        })

        return existingInvoice ? 'Diese Rechnungsnummer existiert bereits' : true
    })
})