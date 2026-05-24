'use client'
import { createContext, useMemo } from 'react'

export const LanguageContext = createContext({ lang: 'fr', setLang: () => {} })

export function LanguageProvider({ children, initialLang = 'fr' }) {
  const value = useMemo(() => ({ lang: initialLang, setLang: () => {} }), [initialLang])
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
