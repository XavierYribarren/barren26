import { getTranslations, locales } from '../../src/lib/i18n'
import MainContent from '../../src/components/MainContent/MainContent'

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

export default function HomePage() {
  return <MainContent />
}
