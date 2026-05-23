'use client'
import { useEffect } from 'react'

export default function HtmlLang({ locale }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return null
}
