// src/sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import structureBuilder from './sanity/structure'
import { projectId, dataset, apiVersion } from './sanity/env'
import schemaTypes from './sanity/schemaTypes'  // Importiere das default export

export default defineConfig({
  name: 'default',
  title: 'SK Online Marketing Dashboard',
  projectId,
  dataset,
  apiVersion,
  basePath: '/studio',
  plugins: [
    deskTool({
      structure: structureBuilder
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes  // Verwende das Array direkt
  }
})