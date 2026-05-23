import { locales } from '../../../src/lib/i18n'
import { siteWebTranslations } from '../../../src/lib/siteWeb'
import SiteWebContent from '../../../src/components/SiteWeb/SiteWebContent'

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  const d = siteWebTranslations[locale] ?? siteWebTranslations.fr
  return {
    title: d.meta.title,
    description: d.meta.description,
    alternates: {
      canonical: `https://barren.dev/${locale}/site-web`,
      languages: Object.fromEntries(
        locales.map(l => [l, `https://barren.dev/${l}/site-web`])
      ),
    },
    openGraph: {
      title: d.meta.title,
      description: d.meta.description,
      url: `https://barren.dev/${locale}/site-web`,
      siteName: 'Barren',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  }
}

export default function SiteWebPage() {
  return <SiteWebContent />
}
