// src/sanity/schemaTypes/projekte.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext, SanityDocument } from '@sanity/types'

interface SanityReference {
    _ref: string;
    _type: 'reference';
    _key?: string;
}

interface FilterDocument {
    unternehmen?: SanityReference;
}

interface ProjectDocument extends SanityDocument {
    users?: SanityReference[];
    unternehmen?: SanityReference;
}

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
            description: 'Der Rechnungsempfänger des Unternehmens hat automatisch Zugriff',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'user' }],
                options: {
                    filter: async ({ document, getClient }: {
                        document: FilterDocument;
                        getClient: any;
                    }) => {
                        const companyId = document?.unternehmen?._ref;
                        if (!companyId) {
                            return {
                                filter: 'aktiv == true',
                                params: {}
                            };
                        }

                        const client = getClient({apiVersion: '2024-01-29'});
                        const company = await client.fetch(`
                            *[_type == "unternehmen" && _id == $companyId][0] {
                                "rechnungsempfaengerId": rechnungsempfaenger._ref
                            }
                        `, { companyId });

                        return {
                            filter: 'aktiv == true && (role != "billing" || _id == $rechnungsempfaengerId)',
                            params: {
                                rechnungsempfaengerId: company?.rechnungsempfaengerId || 'none'
                            }
                        };
                    }
                }
            }],
            validation: Rule => Rule.unique()
        }),
        defineField({
            name: 'unternehmen',
            title: 'Unternehmen',
            type: 'reference',
            to: [{ type: 'unternehmen' }],
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