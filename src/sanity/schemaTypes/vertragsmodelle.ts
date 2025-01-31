// src/sanity/schemaTypes/vertragsmodelle.ts
import { defineType, defineField } from 'sanity'

export const vertragsmodelleSchema = defineType({
    name: 'vertragsmodelle',
    title: 'Vertragsmodelle',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 4,
            validation: Rule => Rule.max(1000),
            description: 'Detaillierte Beschreibung des Vertragsmodells und seiner Vorteile'
        }),
        defineField({
            name: 'preis',
            title: 'Preis',
            type: 'number',
            validation: Rule => Rule.required().min(0).precision(2),
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
            validation: Rule => Rule.required(),
            initialValue: 'monthly'
        }),
        defineField({
            name: 'freeAiSpend',
            title: 'Free AI Spend',
            type: 'number',
            validation: Rule => Rule.required().min(0).precision(2),
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
            validation: Rule => Rule.required(),
            initialValue: 'email'
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
                        type: 'string',
                        validation: Rule => Rule.required()
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
                        title: 'feature'
                    },
                    prepare: ({ title }) => ({
                        title: title || 'Kein Name angegeben'
                    })
                }
            }],
            validation: Rule => Rule.unique(),
            description: 'Liste der Features in diesem Vertragsmodell'
        }),
        defineField({
            name: 'mindestlaufzeit',
            title: 'Mindestlaufzeit',
            type: 'number',
            initialValue: 12,
            validation: Rule => Rule.required().integer().min(1).max(36),
            description: 'Mindestlaufzeit in Monaten'
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
    ]
})
