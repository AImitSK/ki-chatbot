// src/sanity/schemaTypes/zusatzleistungen.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from '@sanity/types'

export const zusatzleistungenSchema = defineType({
    name: 'zusatzleistungen',
    title: 'Zusatzleistungen',
    type: 'document',
    fields: [
        defineField({
            name: 'leistung',
            title: 'Leistung',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(2)
                .custom<string>((leistung, context: ValidationContext) => {
                    if (!leistung) return true

                    const client = context.getClient({apiVersion: '2024-01-29'})
                    return client.fetch(`
                        *[_type == "zusatzleistungen" && leistung == $leistung && _id != $id][0]
                    `, {
                        leistung,
                        id: context.document?._id
                    }).then(existing => {
                        return existing ? 'Eine Zusatzleistung mit diesem Namen existiert bereits' : true
                    })
                })
        }),
        defineField({
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 3,
            validation: Rule => Rule.max(1000)
        }),
        defineField({
            name: 'preis',
            title: 'Preis',
            type: 'number',
            validation: Rule => Rule
                .required()
                .precision(2)
                .positive()
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
            validation: Rule => Rule.required(),
            initialValue: 'other'
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true
        }),
        defineField({
            name: 'einmalig',
            title: 'Einmalige Leistung',
            type: 'boolean',
            initialValue: true
        }),
        defineField({
            name: 'verfuegbarAb',
            title: 'Verfügbar ab Vertragsmodell',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{type: 'vertragsmodelle'}]
            }],
            validation: Rule => Rule.unique()
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
            title: 'leistung',
            preis: 'preis',
            kategorie: 'kategorie',
            einmalig: 'einmalig',
            aktiv: 'aktiv'
        },
        prepare: ({
                      title = 'Neue Leistung',
                      preis = 0,
                      kategorie = 'other',
                      einmalig = false,
                      aktiv = false
                  }) => {
            const kategorieLabels: Record<string, string> = {
                training: 'Training',
                support: 'Support',
                development: 'Entwicklung',
                other: 'Sonstiges'
            }

            const kategorieLabel = kategorieLabels[kategorie] || 'Sonstiges'

            return {
                title,
                subtitle: `${kategorieLabel} - ${preis.toFixed(2)}€ ${einmalig ? '(einmalig)' : '(wiederkehrend)'} ${aktiv ? 'Aktiv' : 'Inaktiv'}`
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
    ]
})