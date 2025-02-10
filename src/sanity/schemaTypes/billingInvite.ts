// src/sanity/schemaTypes/billingInvite.ts
import { defineType, defineField } from 'sanity'

export const billingInviteSchema = defineType({
    name: 'billingInvite',
    title: 'Rechnungsempfänger Einladungen',
    type: 'document',
    fields: [
        defineField({
            name: 'token',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'email',
            type: 'string',
            validation: Rule => Rule.required().email()
        }),
        defineField({
            name: 'name',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'telefon',
            type: 'string'
        }),
        defineField({
            name: 'position',
            type: 'string'
        }),
        defineField({
            name: 'companyId',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'tempPassword',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'expiresAt',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'usedAt',
            type: 'datetime'
        }),
        defineField({
            name: 'createdAt',
            type: 'datetime',
            validation: Rule => Rule.required()
        })
    ]
})