// src/sanity/schemaTypes/environment.ts
import { defineType, defineField } from 'sanity'
import type { ValidationContext, SanityDocument } from 'sanity'

interface EnvironmentDocument extends SanityDocument {
    _type: 'environment'
    botId?: string
    active?: boolean
}

export const environmentSchema = defineType({
    name: 'environment',
    title: 'Environment',
    type: 'document',
    fields: [
        defineField({
            name: 'botId',
            title: 'NEXT_PUBLIC_BOTPRESS_BOT_ID',
            type: 'string',
            validation: Rule => Rule.required().min(10),
            description: 'Die Bot-ID aus dem Botpress Dashboard'
        }),
        defineField({
            name: 'token',
            title: 'NEXT_PUBLIC_BOTPRESS_TOKEN',
            type: 'string',
            validation: Rule => Rule.required(),
            description: 'Der API-Token für den Botpress-Zugriff'
        }),
        defineField({
            name: 'workspaceId',
            title: 'NEXT_PUBLIC_BOTPRESS_WORKSPACE_ID',
            type: 'string',
            validation: Rule => Rule.required(),
            description: 'Die Workspace-ID aus dem Botpress Dashboard'
        }),
        defineField({
            name: 'active',
            title: 'Aktiv',
            type: 'boolean',
            initialValue: true,
            description: 'Ist diese Konfiguration aktiv?'
        }),
        defineField({
            name: 'description',
            title: 'Beschreibung',
            type: 'text',
            rows: 2,
            description: 'Optionale Beschreibung dieser Konfiguration'
        })
    ],
    preview: {
        select: {
            title: 'botId',
            active: 'active'
        },
        prepare({ title, active }) {
            return {
                title: `Bot: ${title}`,
                subtitle: active ? 'Aktiv' : 'Inaktiv',
                media: active ? '🟢' : '🔴'
            }
        }
    },
    initialValue: {
        active: true
    },
    validation: Rule => Rule.custom(async (doc: SanityDocument | undefined, context: ValidationContext) => {
        if (!doc || !doc._type || doc._type !== 'environment') return true

        const value = doc as EnvironmentDocument
        if (!value.active) return true

        const client = context.getClient({apiVersion: '2024-01-29'})
        const existingEnv = await client.fetch(`
      *[_type == "environment" && botId == $botId && active == true && _id != $id][0]
    `, {
            botId: value.botId,
            id: value._id
        })

        return existingEnv ? 'Es kann nur ein aktives Environment pro Bot geben' : true
    })
})