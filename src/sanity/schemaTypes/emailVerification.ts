// src/sanity/schemaTypes/emailVerification.ts
import { defineType, defineField } from 'sanity'

export const emailVerificationSchema = defineType({
    name: 'emailVerification',
    title: 'Email Verifications',
    type: 'document',
    liveEdit: true,
    fields: [
        defineField({
            name: 'token',
            title: 'Token',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'userId',
            title: 'User ID',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'newEmail',
            title: 'New Email',
            type: 'string',
            validation: Rule => Rule.required().email()
        }),
        defineField({
            name: 'expiresAt',
            title: 'Expires At',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'usedAt',
            title: 'Used At',
            type: 'datetime'
        })
    ]
})