// src/lib/sanity/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, token } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})