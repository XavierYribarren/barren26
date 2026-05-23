export const dynamic = 'force-static'

import { projects } from '../src/lib/projects'
import { locales } from '../src/lib/i18n'

const BASE = 'https://barren.dev'

export default function sitemap() {
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
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${BASE}/${l}/projects/${p.slug}`])
        ),
      },
    }))
  )

  return [...home, ...projectPages]
}
