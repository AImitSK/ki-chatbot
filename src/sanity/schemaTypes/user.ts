// src/sanity/schemaTypes/user.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from 'sanity'

export const userSchema = defineType({
    name: 'user',
    title: 'Users',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: Rule => Rule.required().min(2).max(100)
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule.required().email()
                .custom(async (email: string | undefined, context: ValidationContext) => {
                    if (!email) return true
                    const id = context.document?._id
                    const client = context.getClient({apiVersion: '2024-01-29'})
                    const existingUser = await client.fetch(
                        `*[_type == "user" && email == $email && _id != $id][0]`,
                        { email, id }
                    )
                    return existingUser ? 'Diese Email-Adresse wird bereits verwendet' : true
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
            name: 'position',
            title: 'Position',
            type: 'string',
        }),
        defineField({
            name: 'avatar',
            title: 'Avatar',
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
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'role',
            title: 'Rolle',
            type: 'string',
            options: {
                list: [
                    { title: 'Admin', value: 'admin' },
                    { title: 'Rechnungsempfänger', value: 'billing' },
                    { title: 'Benutzer', value: 'user' }
                ]
            },
            initialValue: 'user',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'createdAt',
            title: 'Created at',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated at',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'password',
            type: 'string',
            hidden: true
        })
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'email',
            media: 'avatar'
        }
    },
    orderings: [
        {
            title: 'Name',
            name: 'nameAsc',
            by: [
                {field: 'name', direction: 'asc'}
            ]
        },
        {
            title: 'Erstelldatum',
            name: 'createdAtDesc',
            by: [
                {field: 'createdAt', direction: 'desc'}
            ]
        }
    ]
})