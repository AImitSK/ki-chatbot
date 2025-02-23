// src/sanity/schemaTypes/botEvent.ts
import { defineType, defineField } from 'sanity';

export const botEventSchema = defineType({
    name: 'botEvent',
    title: 'Bot Events',
    type: 'document',
    fields: [
        defineField({
            name: 'eventId',
            title: 'Event ID',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'eventType',
            title: 'Event Type',
            type: 'string',
            validation: Rule => Rule.required(),
            options: {
                list: [
                    { title: 'Conversation Started', value: 'conversation.started' },
                    { title: 'Message Received', value: 'message.received' },
                    { title: 'Conversation Completed', value: 'conversation.completed' },
                    { title: 'Token Usage', value: 'token.usage' }
                ]
            }
        }),
        defineField({
            name: 'timestamp',
            title: 'Timestamp',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'botId',
            title: 'Bot ID',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'projekt',
            title: 'Projekt',
            type: 'reference',
            to: [{ type: 'projekte' }],
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'payload',
            title: 'Event Payload',
            type: 'object',
            fields: [
                // Conversation Started
                defineField({
                    name: 'conversationId',
                    type: 'string',
                    title: 'Conversation ID'
                }),
                defineField({
                    name: 'userId',
                    type: 'string',
                    title: 'User ID'
                }),
                // Message Details
                defineField({
                    name: 'message',
                    type: 'object',
                    title: 'Message',
                    fields: [
                        { name: 'id', type: 'string', title: 'Message ID' },
                        { name: 'text', type: 'string', title: 'Message Text' },
                        { name: 'type', type: 'string', title: 'Message Type' }
                    ]
                }),
                // Conversation Metrics
                defineField({
                    name: 'metrics',
                    type: 'object',
                    title: 'Metrics',
                    fields: [
                        { name: 'messageCount', type: 'number', title: 'Message Count' },
                        { name: 'userMessageCount', type: 'number', title: 'User Messages' },
                        { name: 'botMessageCount', type: 'number', title: 'Bot Messages' },
                        { name: 'duration', type: 'number', title: 'Duration (ms)' }
                    ]
                }),
                // Token Usage
                defineField({
                    name: 'tokens',
                    type: 'number',
                    title: 'Tokens Used'
                }),
                defineField({
                    name: 'cost',
                    type: 'number',
                    title: 'Cost'
                }),
                defineField({
                    name: 'model',
                    type: 'string',
                    title: 'AI Model'
                })
            ]
        })
    ],
    preview: {
        select: {
            title: 'eventType',
            subtitle: 'eventId',
            timestamp: 'timestamp'
        },
        prepare({ title, subtitle, timestamp }) {
            return {
                title: title,
                subtitle: `${new Date(timestamp).toLocaleString()} - ${subtitle}`
            };
        }
    }
});