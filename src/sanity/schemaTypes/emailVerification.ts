// src/sanity/schemaTypes/emailVerification.ts
import { Rule } from '@sanity/types'

interface PreviewProps {
    email: string
    created: string
}

export const emailVerificationSchema = {
    name: 'emailVerification',
    title: 'Email Verifications',
    type: 'document',
    fields: [
        {
            name: 'token',
            title: 'Token',
            type: 'string',
            validation: (Rule: Rule) => Rule.required()
        },
        {
            name: 'userId',
            title: 'User ID',
            type: 'string',
            validation: (Rule: Rule) => Rule.required()
        },
        {
            name: 'newEmail',
            title: 'New Email',
            type: 'string',
            validation: (Rule: Rule) => Rule.required().email()
        },
        {
            name: 'expiresAt',
            title: 'Expires At',
            type: 'datetime',
            validation: (Rule: Rule) => Rule.required()
        },
        {
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            validation: (Rule: Rule) => Rule.required()
        },
        {
            name: 'usedAt',
            title: 'Used At',
            type: 'datetime'
        }
    ],
    preview: {
        select: {
            email: 'newEmail',
            created: 'createdAt'
        },
        prepare({ email, created }: PreviewProps) {
            return {
                title: email,
                subtitle: new Date(created).toLocaleString()
            }
        }
    }
}