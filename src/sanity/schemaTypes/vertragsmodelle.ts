// src/sanity/schemaTypes/vertragsmodelle.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext, SanityDocument } from 'sanity'

interface VertragsmodellDocument extends SanityDocument {
    _type: 'vertragsmodelle'
    name?: string
}

export const vertragsmodelleSchema = defineType({
    name: 'vertragsmodelle',
    title: 'Vertragsmodelle',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: Rule => Rule.required().min(2),
            description: 'Name des Vertragsmodells (z.B. "Basic", "Professional", "Enterprise")'
        }),
        defineField({
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 4,
            description: 'Detaillierte Beschreibung des Vertragsmodells und seiner Vorteile'
        }),
        defineField({
            name: 'preis',
            title: 'Preis',
            type: 'number',
            validation: Rule => Rule.required().min(0),
            description: 'Preis in Euro (netto)'
        }),
        defineField({
            name: 'zahlungsintervall',
            title: 'Zahlungsintervall',
            type: 'string',
            options: {
                list: [
                    {title: 'Monatlich', value: 'monthly'},
                    {title: 'Jährlich', value: 'yearly'}
                ],
                layout: 'radio'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'freeAiSpend',
            title: 'Free AI Spend',
            type: 'number',
            validation: Rule => Rule.required().min(0),
            description: 'Inkludiertes AI-Budget in Euro pro Monat'
        }),
        defineField({
            name: 'supportlevel',
            title: 'Supportlevel',
            type: 'string',
            options: {
                list: [
                    {title: 'Email', value: 'email'},
                    {title: 'Email und Telefon', value: 'email_phone'},
                    {title: 'Premium Support', value: 'premium'}
                ],
                layout: 'radio'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'hitlFunktion',
            title: 'HITL-Funktion',
            type: 'boolean',
            initialValue: false,
            description: 'Human in the Loop Funktionalität verfügbar'
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            description: 'Ist dieses Vertragsmodell aktuell buchbar?'
        }),
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    {
                        name: 'feature',
                        title: 'Feature',
                        type: 'string'
                    },
                    {
                        name: 'included',
                        title: 'Enthalten',
                        type: 'boolean',
                        initialValue: true
                    }
                ],
                preview: {
                    select: {
                        title: 'feature',
                        included: 'included'
                    },
                    prepare: ({title, included}) => ({
                        title: title,
                        media: included ? '✅' : '❌'
                    })
                }
            }],
            description: 'Liste der Features in diesem Vertragsmodell'
        }),
        defineField({
            name: 'mindestlaufzeit',
            title: 'Mindestlaufzeit',
            type: 'number',
            initialValue: 12,
            description: 'Mindestlaufzeit in Monaten',
            validation: Rule => Rule.min(1).max(36)
        })
    ],
    preview: {
        select: {
            title: 'name',
            preis: 'preis',
            interval: 'zahlungsintervall',
            aktiv: 'aktiv'
        },
        prepare: ({title, preis, interval, aktiv}) => ({
            title: title,
            subtitle: `${preis}€ ${interval === 'monthly' ? '/ Monat' : '/ Jahr'} ${aktiv ? '✓' : '❌'}`,
            media: aktiv ? '📄' : '📝'
        })
    },
    orderings: [
        {
            title: 'Preis aufsteigend',
            name: 'preisAsc',
            by: [
                {field: 'preis', direction: 'asc'}
            ]
        },
        {
            title: 'Name',
            name: 'nameAsc',
            by: [
                {field: 'name', direction: 'asc'}
            ]
        }
    ],
    validation: Rule => Rule.custom(async (doc: SanityDocument | undefined, context: ValidationContext) => {
        if (!doc || !doc._type || doc._type !== 'vertragsmodelle') return true

        const value = doc as VertragsmodellDocument
        if (!value.name) return true

        const client = context.getClient({apiVersion: '2024-01-29'})
        const existingModel = await client.fetch(`
      *[_type == "vertragsmodelle" && name == $name && _id != $id][0]
    `, {
            name: value.name,
            id: value._id
        })

        return existingModel ? 'Ein Vertragsmodell mit diesem Namen existiert bereits' : true
    })
})