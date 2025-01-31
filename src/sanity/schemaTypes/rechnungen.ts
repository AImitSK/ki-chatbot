// src/sanity/schemaTypes/rechnungen.ts
import { defineType, defineField } from 'sanity'

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
            validation: Rule => Rule.required()
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
            options: {
                dateFormat: 'DD.MM.YYYY'
            }
        })
    ],
    preview: {
        select: {
            number: 'rechnungsnummer',
            date: 'rechnungsdatum',
            betrag: 'betrag',
            projektName: 'projekt.titel'
        },
        prepare: ({number, date, betrag, projektName}) => ({
            title: `Rechnung ${number}`,
            subtitle: `${projektName} - ${new Date(date).toLocaleDateString('de-DE')} - ${betrag?.toFixed(2)}€`
        })
    }
})