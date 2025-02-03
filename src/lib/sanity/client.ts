// src/lib/sanity/client.ts
import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { token } from '@/sanity/env'


const options: any = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
}

// Token nur auf dem Server setzen
if (typeof window === 'undefined') {
  options.token = token
}

export const client = createClient(options)
