import { locales } from '../../src/lib/i18n'
import { LanguageProvider } from '../../src/i18n'
import ClientLayout from '../../src/components/ClientLayout/ClientLayout'
import HtmlLang from '../../src/components/HtmlLang/HtmlLang'
import 'lenis/dist/lenis.css'
import '../../src/styles/global.css'

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  return (
    <LanguageProvider initialLang={locale}>
      <HtmlLang locale={locale} />
      <ClientLayout>
        {children}
      </ClientLayout>
    </LanguageProvider>
  )
}
