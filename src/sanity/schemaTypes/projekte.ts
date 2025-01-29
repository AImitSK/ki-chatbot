// src/sanity/schemaTypes
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
            validation: (Rule) => Rule.required().min(2).max(100)
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'titel',
                maxLength: 96
            },
            validation: (Rule) => Rule.required()
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
            validation: (Rule) => Rule.required().min(1)
        }),
        defineField({
            name: 'unternehmen',
            title: 'Unternehmen',
            type: 'reference',
            to: [{ type: 'unternehmen' }],
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'rechnungsempfaenger',
            title: 'Rechnungsempfänger',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'vertragsmodell',
            title: 'Vertragsmodell',
            type: 'reference',
            to: [{ type: 'vertragsmodelle' }],
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'vertragsbeginn',
            title: 'Vertragsbeginn',
            type: 'date',
            validation: (Rule) => Rule.required()
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
            validation: (Rule) => Rule.required().min(0)
        }),
        defineField({
            name: 'zusatzleistungen',
            title: 'Zusatzleistungen',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'zusatzleistungen' }]
            }]
        }),
        defineField({
            name: 'environment',
            title: 'Environment',
            type: 'reference',
            to: [{ type: 'environment' }],
            validation: (Rule) => Rule.required()
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
            contract: 'vertragsmodell.name'
        },
        prepare: ({title, company, contract}: {title: string, company: string, contract: string}) => ({
            title: title,
            subtitle: `${company} - ${contract}`
        })
    }
})