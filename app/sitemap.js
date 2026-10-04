export const dynamic = 'force-static'

import { locales } from '../src/lib/i18n'
import { sanityFetch } from '../src/lib/sanity/client'
import { PROJECT_SLUGS_QUERY } from '../src/lib/sanity/queries'

const BASE = 'https://barren.dev'

export default async function sitemap() {
  const projects = await sanityFetch(PROJECT_SLUGS_QUERY)

  const home = locales.map(locale => ({
    url: `${BASE}/${locale}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(locales.map(l => [l, `${BASE}/${l}`])),
    },
  }))

  const projectPages = locales.flatMap(locale =>
    projects.map(p => ({
      url: `${BASE}/${locale}/projects/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${BASE}/${l}/projects/${p.slug}`])
        ),
      },
    }))
  )

  return [...home, ...projectPages]
}
