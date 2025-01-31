// sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import schemaTypes from '@/sanity/schemaTypes'
import { apiVersion, dataset, projectId } from '@/sanity/env'

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
    deskTool(),
    visionTool({defaultApiVersion: apiVersion})
  ],
})

export default config