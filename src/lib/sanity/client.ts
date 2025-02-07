// lib/sanity/client.ts
import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId, token } from '@/sanity/env'

// Client für lesende Operationen - kein CDN Cache
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,  // Geändert zu false
  perspective: 'published',
  stega: false
})

// Client für schreibende Operationen
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'published',
  stega: false
})

// Legacy Export für Kompatibilität
export const sanityClient = client
export default client