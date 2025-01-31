// src/sanity/schemaTypes/projekte.ts
import { defineType, defineField } from 'sanity'

export const projektSchema = defineType({
    name: 'projekte',
    title: 'Projekte',
    type: 'document',
    fields: [
        defineField({
            name: 'titel',
            title: 'Titel',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'titel',
                maxLength: 96
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'users',
            title: 'Berechtigte User',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'user' }],
                options: {
                    filter: 'aktiv == true'
                }
            }],
            validation: Rule => Rule.required().min(1)
        }),
        defineField({
            name: 'unternehmen',
            title: 'Unternehmen',
            type: 'reference',
            to: [{ type: 'unternehmen' }],
            options: {
                filter: 'aktiv == true'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'rechnungsempfaenger',
            title: 'Rechnungsempfänger',
            type: 'reference',
            to: [{ type: 'user' }],
            options: {
                filter: 'aktiv == true && role == "billing"'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'vertragsmodell',
            title: 'Vertragsmodell',
            type: 'reference',
            to: [{ type: 'vertragsmodelle' }],
            options: {
                filter: 'aktiv == true'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'vertragsbeginn',
            title: 'Vertragsbeginn',
            type: 'date',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'vertragsende',
            title: 'Vertragsende',
            type: 'date'
        }),
        defineField({
            name: 'aiSpendLimit',
            title: 'AI Spend-Limit',
            type: 'number',
            validation: Rule => Rule
                .required()
                .min(0)
                .precision(2),
            description: 'Monatliches Limit für AI-Ausgaben in Euro'
        }),
        defineField({
            name: 'zusatzleistungen',
            title: 'Zusatzleistungen',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'zusatzleistungen' }],
                options: {
                    filter: 'aktiv == true'
                }
            }]
        }),
        defineField({
            name: 'environment',
            title: 'Environment',
            type: 'reference',
            to: [{ type: 'environment' }],
            options: {
                filter: 'aktiv == true'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'notizen',
            title: 'Notizen',
            type: 'text',
            rows: 4
        })
    ],
    preview: {
        select: {
            title: 'titel',
            company: 'unternehmen.name',
            contract: 'vertragsmodell.name',
            endDate: 'vertragsende'
        },
        prepare: ({title = '', company = '', contract = '', endDate}) => {
            const isExpired = endDate && new Date(endDate) < new Date()
            return {
                title,
                subtitle: `${company} - ${contract}${isExpired ? ' (abgelaufen)' : ''}`
            }
        }
    }
})