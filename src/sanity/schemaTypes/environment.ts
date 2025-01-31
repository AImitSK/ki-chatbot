// src/sanity/schemaTypes/environment.ts
import { defineType, defineField } from 'sanity'
import type { Environment } from '@/types/sanity'
import type { ValidationContext } from '@sanity/types'

export const environmentSchema = defineType({
    name: 'environment',
    title: 'Environment',
    type: 'document',
    fields: [
        defineField({
            name: 'botId',
            title: 'NEXT_PUBLIC_BOTPRESS_BOT_ID',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(10)
                .custom<string>((botId, context: ValidationContext) => {
                    if (!botId) return true

                    const client = context.getClient({apiVersion: '2024-01-29'})
                    return client.fetch(`
                        *[_type == "environment" && botId == $botId && _id != $id][0]
                    `, {
                        botId,
                        id: context.document?._id
                    }).then(existingBot => {
                        return existingBot ? 'Diese Bot-ID wird bereits verwendet' : true
                    })
                }),
            description: 'Die Bot-ID aus dem Botpress Dashboard'
        }),
        defineField({
            name: 'token',
            title: 'NEXT_PUBLIC_BOTPRESS_TOKEN',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(32)
                .regex(/^[a-zA-Z0-9_-]+$/, {
                    name: 'token format',
                    invert: false
                }),
            description: 'Der API-Token für den Botpress-Zugriff'
        }),
        defineField({
            name: 'workspaceId',
            title: 'NEXT_PUBLIC_BOTPRESS_WORKSPACE_ID',
            type: 'string',
            validation: Rule => Rule
                .required()
                .min(5),
            description: 'Die Workspace-ID aus dem Botpress Dashboard'
        }),
        defineField({
            name: 'aktiv',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            validation: Rule => Rule.required(),
            description: 'Ist diese Konfiguration aktiv?'
        }),
        defineField({
            name: 'description',
            title: 'Beschreibung',
            type: 'text',
            rows: 2,
            validation: Rule => Rule.max(500),
            description: 'Optionale Beschreibung dieser Konfiguration'
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
            title: 'botId',
            active: 'aktiv',
            description: 'description'
        },
        prepare({ title, active, description }) {
            return {
                title: `Bot: ${title}`,
                subtitle: `${active ? 'Aktiv' : 'Inaktiv'}${description ? ' - ' + description : ''}`,
                media: active ? '🟢' : '🔴'
            }
        }
    },
    validation: Rule => Rule.custom<Environment>((doc, context: ValidationContext) => {
        if (!doc?.aktiv) return true

        const client = context.getClient({apiVersion: '2024-01-29'})
        return client.fetch(`
            *[_type == "environment" && botId == $botId && aktiv == true && _id != $id][0]
        `, {
            botId: doc.botId,
            id: context.document?._id
        }).then(existingEnv => {
            return existingEnv ? 'Es kann nur ein aktives Environment pro Bot geben' : true
        })
    })
})