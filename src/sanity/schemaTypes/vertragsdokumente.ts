// src/sanity/schemaTypes/vertragsdokumente.ts
import { defineType, defineField } from 'sanity'

export const vertragsdokumenteSchema = defineType({
    name: 'vertragsdokumente',
    title: 'Vertragsdokumente',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Dokumentname',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'datei',
            title: 'Dokument',
            type: 'file',
            validation: Rule => Rule.required(),
            options: {
                accept: '.pdf,.doc,.docx,.txt'
            }
        }),
        defineField({
            name: 'typ',
            title: 'Dokumenttyp',
            type: 'string',
            options: {
                list: [
                    {title: 'Vertrag', value: 'vertrag'},
                    {title: 'AGB', value: 'agb'},
                    {title: 'Datenschutzerklärung', value: 'datenschutz'},
                    {title: 'Sonstiges', value: 'sonstiges'}
                ]
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'projekt',
            title: 'Zugehöriges Projekt',
            type: 'reference',
            to: [{type: 'projekte'}],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'erstellungsdatum',
            title: 'Erstellungsdatum',
            type: 'date',
            options: {
                dateFormat: 'DD.MM.YYYY'
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            description: 'Ist dieses Dokument aktuell gültig?'
        }),
        defineField({
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 3
        })
    ],
    preview: {
        select: {
            title: 'name',
            typ: 'typ',
            date: 'erstellungsdatum',
            projekt: 'projekt.titel',
            active: 'aktiv'
        },
        prepare: ({title, typ, date, projekt, active}) => {
            const typeLabels = {
                vertrag: 'Vertrag',
                agb: 'AGB',
                datenschutz: 'Datenschutzerklärung',
                sonstiges: 'Sonstiges'
            }

            return {
                title: title || 'Unbenanntes Dokument',
                subtitle: `${typeLabels[typ as keyof typeof typeLabels] || 'Dokument'} - ${projekt || 'Kein Projekt'} - ${date || 'Kein Datum'} ${active ? '✓' : '❌'}`
            }
        }
    }
})