// src/sanity/schemaTypes/projekte.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from '@sanity/types'

export const projektSchema = defineType({
    name: 'projekte',
    title: 'Projekte',
    type: 'document',
    fields: [
        defineField({
            name: 'titel',
            title: 'Titel',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(2)
                .max(100)
                .custom((titel, context: ValidationContext) => {
                    if (!titel) return true

                    const client = context.getClient({apiVersion: '2024-01-29'})
                    const query = `*[_type == "projekte" && titel == $titel && !(_id in [$id])][0]`

                    return client.fetch(query, {
                        titel,
                        id: context.document?._id || 'none'
                    }).then(exists => {
                        return exists ? 'Ein Projekt mit diesem Titel existiert bereits' : true
                    })
                })
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
                to: [{ type: 'user' }]
            }],
            validation: Rule => Rule
                .required()
                .min(1)
                .unique()
        }),
        defineField({
            name: 'unternehmen',
            title: 'Unternehmen',
            type: 'reference',
            to: [{ type: 'unternehmen' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'rechnungsempfaenger',
            title: 'Rechnungsempfänger',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'vertragsmodell',
            title: 'Vertragsmodell',
            type: 'reference',
            to: [{ type: 'vertragsmodelle' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'vertragsbeginn',
            title: 'Vertragsbeginn',
            type: 'date',
            validation: Rule => Rule.required(),
            options: {
                dateFormat: 'DD.MM.YYYY'
            }
        }),
        defineField({
            name: 'vertragsende',
            title: 'Vertragsende',
            type: 'date',
            options: {
                dateFormat: 'DD.MM.YYYY'
            },
            validation: Rule => Rule.min(Rule.valueOfField('vertragsbeginn'))
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
                to: [{ type: 'zusatzleistungen' }]
            }],
            validation: Rule => Rule.unique()
        }),
        defineField({
            name: 'environment',
            title: 'Environment',
            type: 'reference',
            to: [{ type: 'environment' }],
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

