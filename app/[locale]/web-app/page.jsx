import { locales } from '../../../src/lib/i18n'
import { webAppTranslations } from '../../../src/lib/webApp'
import WebAppContent from '../../../src/components/WebApp/WebAppContent'

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  const d = webAppTranslations[locale] ?? webAppTranslations.fr
  return {
    title: d.meta.title,
    description: d.meta.description,
    alternates: {
      canonical: `https://barren.dev/${locale}/web-app`,
      languages: Object.fromEntries(
        locales.map(l => [l, `https://barren.dev/${l}/web-app`])
      ),
    },
    openGraph: {
      title: d.meta.title,
      description: d.meta.description,
      url: `https://barren.dev/${locale}/web-app`,
      siteName: 'Barren',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  }
}

export default function WebAppPage() {
  return <WebAppContent />
}
