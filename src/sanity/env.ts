// src/sanity/env.ts
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-29'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const token = process.env.SANITY_API_TOKEN

// Validierung nur auf Server-Seite
if (!projectId && typeof window === 'undefined') {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
}
if (!dataset && typeof window === 'undefined') {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
}