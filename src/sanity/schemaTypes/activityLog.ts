// src/sanity/schemaTypes/activityLog.ts
import { defineType, defineField } from 'sanity'

export const activityLogSchema = defineType({
    name: 'activityLog',
    title: 'Activity Log',
    type: 'document',
    fields: [
        defineField({
            name: 'activityType',
            title: 'Activity Type',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'details',
            title: 'Details',
            type: 'text'
        }),
        defineField({
            name: 'timestamp',
            title: 'Timestamp',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'userId',
            title: 'User ID',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'userEmail',
            title: 'User Email',
            type: 'string'
        })
    ]
})