// src/sanity/schemaTypes/zusatzleistungen.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext, SanityDocument } from 'sanity'

interface ZusatzleistungDocument extends SanityDocument {
    _type: 'zusatzleistungen'
    leistung?: string
}

type KategorieType = 'training' | 'support' | 'development' | 'other'

const kategorieEmojis: Record<KategorieType, string> = {
    training: '📚',
    support: '🛟',
    development: '💻',
    other: '🔧'
}

export const zusatzleistungenSchema = defineType({
    name: 'zusatzleistungen',
    title: 'Zusatzleistungen',
    type: 'document',
    fields: [
        defineField({
            name: 'leistung',
            title: 'Leistung',
            type: 'string',
            validation: Rule => Rule.required().min(2),
            description: 'Name der Zusatzleistung'
        }),
        defineField({
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 3,
            description: 'Detaillierte Beschreibung der Zusatzleistung'
        }),
        defineField({
            name: 'preis',
            title: 'Preis',
            type: 'number',
            validation: Rule => Rule.required().min(0),
            description: 'Preis in Euro (netto)'
        }),
        defineField({
            name: 'kategorie',
            title: 'Kategorie',
            type: 'string',
            options: {
                list: [
                    {title: 'Training', value: 'training'},
                    {title: 'Support', value: 'support'},
                    {title: 'Entwicklung', value: 'development'},
                    {title: 'Sonstiges', value: 'other'}
                ]
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            description: 'Ist diese Zusatzleistung aktuell buchbar?'
        }),
        defineField({
            name: 'einmalig',
            title: 'Einmalige Leistung',
            type: 'boolean',
            initialValue: true,
            description: 'Einmalige oder wiederkehrende Leistung'
        }),
        defineField({
            name: 'verfuegbarAb',
            title: 'Verfügbar ab Vertragsmodell',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{type: 'vertragsmodelle'}]
            }],
            description: 'In welchen Vertragsmodellen ist diese Zusatzleistung verfügbar?'
        }),
        defineField({
            name: 'icon',
            title: 'Icon',
            type: 'image',
            options: {
                hotspot: true
            },
            description: 'Icon für die Zusatzleistung'
        })
    ],
    preview: {
        select: {
            title: 'leistung',
            preis: 'preis',
            einmalig: 'einmalig',
            aktiv: 'aktiv',
            kategorie: 'kategorie',
            media: 'icon'
        },
        prepare: ({title, preis, einmalig, aktiv, kategorie, media}) => {
            return {
                title: title,
                subtitle: `${preis}€ ${einmalig ? '(einmalig)' : '(wiederkehrend)'} ${aktiv ? '✓' : '❌'}`,
                media: media || kategorieEmojis[kategorie as KategorieType] || '📦'
            }
        }
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
            title: 'Kategorie',
            name: 'kategorieAsc',
            by: [
                {field: 'kategorie', direction: 'asc'},
                {field: 'leistung', direction: 'asc'}
            ]
        }
    ],
    validation: Rule => Rule.custom(async (doc: SanityDocument | undefined, context: ValidationContext) => {
        if (!doc || !doc._type || doc._type !== 'zusatzleistungen') return true

        const value = doc as ZusatzleistungDocument
        if (!value.leistung) return true

        const client = context.getClient({apiVersion: '2024-01-29'})
        const existingService = await client.fetch(`
     *[_type == "zusatzleistungen" && leistung == $leistung && _id != $id][0]
   `, {
            leistung: value.leistung,
            id: value._id
        })

        return existingService ? 'Eine Zusatzleistung mit diesem Namen existiert bereits' : true
    })
})