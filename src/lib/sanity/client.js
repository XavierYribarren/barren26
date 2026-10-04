import { createClient } from '@sanity/client'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

// Dataset public, pas de token : on ne lit que le contenu publié
export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-10-01',
  useCdn: false,
  perspective: 'published',
})

// Cache Next : invalidé par revalidateTag('project'), avec un filet de sécurité d'une heure
export function sanityFetch(query, params = {}, { tags = ['project'], revalidate = 3600 } = {}) {
  return client.fetch(query, params, { next: { tags, revalidate } })
}
