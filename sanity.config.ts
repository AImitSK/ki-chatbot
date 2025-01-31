// sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import schemaTypes from '@/sanity/schemaTypes'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import structureBuilder from '@/sanity/structure'

const config = defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'Chatbot Kunden-Backend',
  apiVersion,
  schema: {
    types: schemaTypes
  },
  plugins: [
    deskTool({
      structure: structureBuilder
    }),
    visionTool({defaultApiVersion: apiVersion})
  ],
})

export default config