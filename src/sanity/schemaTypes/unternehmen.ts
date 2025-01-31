// src/sanity/schemaTypes/unternehmen.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from '@sanity/types'

export const unternehmenSchema = defineType({
    name: 'unternehmen',
    title: 'Unternehmen',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Unternehmen',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(2)
                .max(100)
                .custom<string>((name, context: ValidationContext) => {
                    if (!name) return true

                    const client = context.getClient({apiVersion: '2024-01-29'})
                    return client.fetch(`
                        *[_type == "unternehmen" && name == $name && _id != $id][0]
                    `, {
                        name,
                        id: context.document?._id
                    }).then(existingCompany => {
                        return existingCompany ? 'Ein Unternehmen mit diesem Namen existiert bereits' : true
                    })
                }),
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
            validation: Rule => Rule
                .required()
                .length(5)
                .regex(/^[0-9]{5}$/, {
                    name: 'plz format',
                    invert: false
                })
                .error('Bitte geben Sie eine gültige PLZ ein (5 Ziffern)'),
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
            title: 'USt-IdNr.',
            type: 'string',
            description: 'Format: DE123456789',
            validation: Rule => Rule
                .custom<string>((ustId) => {
                    if (!ustId) return true
                    if (!ustId.match(/^DE[0-9]{9}$/)) {
                        return 'Bitte geben Sie eine gültige deutsche USt-IdNr. ein (Format: DE + 9 Ziffern)'
                    }
                    return true
                })
        }),
        defineField({
            name: 'telefon',
            title: 'Telefon',
            type: 'string',
            validation: Rule => Rule
                .custom<string>((tel) => {
                    if (!tel) return true
                    if (!tel.match(/^[+\d\s-()]*$/)) {
                        return 'Bitte geben Sie eine gültige Telefonnummer ein'
                    }
                    return true
                })
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule
                .email()
                .error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
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
                hotspot: true,
                accept: 'image/*'
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }
            ]
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