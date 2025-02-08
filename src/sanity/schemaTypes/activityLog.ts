// src/sanity/schemaTypes/activityLog.ts
import { defineType, defineField } from 'sanity'

export const activityLogSchema = defineType({
    name: 'activityLog',
    title: 'Aktivitätsprotokoll',
    type: 'document',
    fields: [
        defineField({
            name: 'user',
            title: 'Benutzer',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'activityType',
            title: 'Aktivitätstyp',
            type: 'string',
            options: {
                list: [
                    { title: 'Login', value: 'login' },
                    { title: 'Logout', value: 'logout' },
                    { title: 'Passwort ändern', value: 'password_change' },
                    { title: 'Profil aktualisiert', value: 'profile_update' },
                    { title: '2FA aktiviert', value: '2fa_enabled' },
                    { title: '2FA deaktiviert', value: '2fa_disabled' },
                    { title: 'Fehlgeschlagener Login', value: 'login_failed' }
                ]
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'timestamp',
            title: 'Zeitstempel',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'ipAddress',
            title: 'IP-Adresse',
            type: 'string'
        }),
        defineField({
            name: 'userAgent',
            title: 'User Agent',
            type: 'string'
        }),
        defineField({
            name: 'details',
            title: 'Details',
            type: 'text'
        })
    ],
    orderings: [
        {
            title: 'Zeitstempel, Neueste',
            name: 'timestampDesc',
            by: [{ field: 'timestamp', direction: 'desc' }]
        }
    ],
    preview: {
        select: {
            title: 'activityType',
            user: 'user.name',
            date: 'timestamp'
        },
        prepare({ title, user, date }) {
            return {
                title: title,
                subtitle: `${user} - ${new Date(date).toLocaleString()}`
            }
        }
    }
})