'use client'
import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'
import { translations } from '../lib/i18n'

export { LanguageProvider } from './LanguageContext'
export { translations }

export function useTranslation() {
  const { lang, setLang } = useContext(LanguageContext)

  const t = (key) => {
    const parts = key.split('.')
    let val = translations[lang]
    for (const part of parts) {
      if (val == null) return key
      val = val[part]
    }
    return val !== undefined ? val : key
  }

  return { t, lang, setLang }
}
