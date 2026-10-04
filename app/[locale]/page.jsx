import { getTranslations, locales } from '../../src/lib/i18n'
import MainContent from '../../src/components/MainContent/MainContent'
import { sanityFetch } from '../../src/lib/sanity/client'
import { PROJECTS_QUERY } from '../../src/lib/sanity/queries'
import { toLegacyProject } from '../../src/lib/sanity/adapters'

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = getTranslations(locale)
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `https://barren.dev/${locale}`,
      languages: { fr: 'https://barren.dev/fr', en: 'https://barren.dev/en' },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: `https://barren.dev/${locale}`,
      siteName: 'Barren',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t.meta.title,
      description: t.meta.description,
    },
  }
}

export default async function HomePage({ params }) {
  const { locale } = await params
  const projects = (await sanityFetch(PROJECTS_QUERY, { locale })).map(toLegacyProject)
  return <MainContent projects={projects} />
}
