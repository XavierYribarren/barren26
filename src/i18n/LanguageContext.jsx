'use client'
import { createContext } from 'react'

export const LanguageContext = createContext({ lang: 'fr', setLang: () => {} })

export function LanguageProvider({ children, initialLang = 'fr' }) {
  return (
    <LanguageContext.Provider value={{ lang: initialLang, setLang: () => {} }}>
      {children}
    </LanguageContext.Provider>
  )
}
