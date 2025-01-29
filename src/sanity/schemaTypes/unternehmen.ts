// src/sanity/schemaTypes/unternehmen.ts
import { defineType, defineField } from 'sanity'

export const unternehmenSchema = defineType({
    name: 'unternehmen',
    title: 'Unternehmen',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Unternehmen',
            type: 'string',
            validation: Rule => Rule.required().min(2).max(100),
            description: 'Offizieller Unternehmensname'
        }),
        defineField({
            name: 'strasse',
            title: 'Straße',
            type: 'string',
            validation: Rule => Rule.required(),
            description: 'Straße und Hausnummer'
        }),
        defineField({
            name: 'plz',
            title: 'PLZ',
            type: 'string',
            validation: Rule => Rule.required().custom((plz) => {
                if (!plz?.match(/^[0-9]{5}$/)) {
                    return 'Bitte geben Sie eine gültige PLZ ein (5 Ziffern)'
                }
                return true
            })
        }),
        defineField({
            name: 'ort',
            title: 'Ort',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'land',
            title: 'Land',
            type: 'string',
            validation: Rule => Rule.required(),
            initialValue: 'Deutschland',
            options: {
                list: [
                    'Deutschland',
                    'Österreich',
                    'Schweiz',
                    'Andere'
                ]
            }
        }),
        defineField({
            name: 'ustIdNr',
            title: 'UST IDNr.',
            type: 'string',
            description: 'Format: DE123456789',
            validation: Rule => Rule.custom((ustId) => {
                if (ustId && !ustId.match(/^DE[0-9]{9}$/)) {
                    return 'Bitte geben Sie eine gültige deutsche USt-IdNr. ein (Format: DE + 9 Ziffern)'
                }
                return true
            })
        }),
        defineField({
            name: 'telefon',
            title: 'Telefon',
            type: 'string',
            validation: Rule => Rule.custom((tel) => {
                if (tel && !tel.match(/^[+\d\s-()]*$/)) {
                    return 'Bitte geben Sie eine gültige Telefonnummer ein'
                }
                return true
            })
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule.email().error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
        }),
        defineField({
            name: 'webseite',
            title: 'Webseite',
            type: 'url',
            validation: Rule => Rule.uri({
                scheme: ['http', 'https']
            })
        }),
        defineField({
            name: 'logo',
            title: 'Unternehmenslogo',
            type: 'image',
            options: {
                hotspot: true
            }
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            description: 'Ist dieses Unternehmen noch aktiver Kunde?'
        }),
        defineField({
            name: 'notizen',
            title: 'Interne Notizen',
            type: 'text',
            rows: 3
        })
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'ort',
            media: 'logo',
            aktiv: 'aktiv'
        },
        prepare: ({title, subtitle, media, aktiv}) => ({
            title: title,
            subtitle: `${subtitle} ${aktiv ? '✓' : '❌'}`,
            media: media
        })
    },
    orderings: [
        {
            title: 'Unternehmensname',
            name: 'nameAsc',
            by: [
                {field: 'name', direction: 'asc'}
            ]
        },
        {
            title: 'PLZ',
            name: 'plzAsc',
            by: [
                {field: 'plz', direction: 'asc'}
            ]
        }
    ]
})