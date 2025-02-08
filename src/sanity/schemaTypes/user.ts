// src/sanity/schemaTypes/user.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext } from '@sanity/types'

export const userSchema = defineType({
    name: 'user',
    title: 'Users',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(2)
                .max(100)
                .error('Der Name muss zwischen 2 und 100 Zeichen lang sein')
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule
                .required()
                .email()
            // Entfernen der unnötigen Unique-Validierung, da wir den User ja bearbeiten wollen
        }),
        defineField({
            name: 'telefon',
            title: 'Telefon',
            type: 'string',
            validation: Rule => Rule.custom<string>(telefon => {
                if (!telefon) return true
                // Erlaubt: +49123456789, 0123-456789, (0123) 456789, etc.
                const telefonRegex = /^[+\d\s-()]*$/
                return telefonRegex.test(telefon) ? true : 'Bitte geben Sie eine gültige Telefonnummer ein'
            })
        }),
        defineField({
            name: 'position',
            title: 'Position',
            type: 'string',
            description: 'Position/Rolle im Unternehmen'
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
                    description: 'Wichtig für Barrierefreiheit'
                }
            ],
            validation: Rule => Rule.custom<{ asset?: { _ref: string; _type: 'reference' }; alt?: string }>((avatar) => {
                if (avatar?.asset && !avatar.alt) {
                    return 'Bitte fügen Sie einen alternativen Text für das Avatar-Bild hinzu'
                }
                return true
            })
        }),
        defineField({
            name: 'role',
            title: 'Rolle',
            type: 'string',
            options: {
                list: [
                    {title: 'Admin', value: 'admin'},
                    {title: 'Rechnungsempfänger', value: 'billing'},
                    {title: 'Benutzer', value: 'user'}
                ],
                layout: 'radio'
            },
            initialValue: 'user',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            validation: Rule => Rule.required(),
            description: 'Inaktive Benutzer können sich nicht einloggen'
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
        }),
        defineField({
            name: 'lastLogin',
            title: 'Letzter Login',
            type: 'datetime',
            readOnly: true
        }),
        defineField({
            name: 'password',
            type: 'string',
            hidden: true,
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'emailVerified',
            type: 'datetime',
            hidden: true,
        }),
        defineField({
            name: 'accounts',
            type: 'array',
            hidden: true,
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'provider', type: 'string' },
                        { name: 'type', type: 'string' },
                        { name: 'providerAccountId', type: 'string' },
                        { name: 'access_token', type: 'string' },
                        { name: 'refresh_token', type: 'string' },
                        { name: 'expires_at', type: 'number' },
                        { name: 'token_type', type: 'string' },
                        { name: 'scope', type: 'string' },
                        { name: 'id_token', type: 'string' },
                        { name: 'session_state', type: 'string' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'sessions',
            type: 'array',
            hidden: true,
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'sessionToken', type: 'string' },
                        { name: 'expires', type: 'datetime' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'notizen',
            title: 'Interne Notizen',
            type: 'text',
            rows: 3
        }),

        // Hier kommen die 2FA-Felder hin
        defineField({
            name: 'twoFactorEnabled',
            title: 'Two Factor Authentication Enabled',
            type: 'boolean',
            initialValue: false
        }),
        defineField({
            name: 'twoFactorSecret',
            title: 'Two Factor Secret',
            type: 'string',
            hidden: true
        }),
        defineField({
            name: 'tempTwoFactorSecret',
            title: 'Temporary Two Factor Secret',
            type: 'string',
            hidden: true
        }),
        defineField({
            name: 'twoFactorSetupPending',
            title: 'Two Factor Setup Pending',
            type: 'boolean',
            initialValue: false
        }),
        defineField({
            name: 'recoveryCodes',
            title: 'Recovery Codes',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: true
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'email',
            role: 'role',
            aktiv: 'aktiv',
            media: 'avatar'
        },
        prepare: ({title, subtitle, role, aktiv, media}) => {
            const roleLabels = {
                admin: '👑 Admin',
                billing: '💰 Rechnungsempfänger',
                user: '👤 Benutzer'
            }

            return {
                title: title,
                subtitle: `${subtitle} - ${roleLabels[role as keyof typeof roleLabels]} ${aktiv ? '✓' : '❌'}`,
                media: media
            }
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
            title: 'Rolle',
            name: 'roleAsc',
            by: [
                {field: 'role', direction: 'asc'},
                {field: 'name', direction: 'asc'}
            ]
        },
        {
            title: 'Letzte Aktivität',
            name: 'lastLoginDesc',
            by: [
                {field: 'lastLogin', direction: 'desc'}
            ]
        }
    ]
})