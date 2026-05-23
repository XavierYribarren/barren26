'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    const preferred = navigator.language.startsWith('fr') ? 'fr' : 'en'
    router.replace(`/${preferred}`)
  }, [router])
  return null
}
