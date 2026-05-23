'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { splitWords } from '../../utils/splitWords'

export default function AppInit() {
  const loadedRef = useRef(false)

  useLayoutEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const sidebar = document.querySelector('[data-sidebar]')
      if (sidebar) gsap.set(sidebar, { x: '-100%' })
    }
  }, [])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tl = gsap.timeline()

    const sidebar = document.querySelector('[data-sidebar]')
    if (sidebar) tl.to(sidebar, { x: '0%', duration: 1, ease: 'expo.out' }, 0)

    const headline = document.querySelector('[data-hero-headline]')
    if (headline) {
      const words = splitWords(headline)
      tl.from(words, { y: '100%', duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0.15)
    }

    tl.from('[data-hero-label]',  { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.6)
    tl.from('[data-hero-subline]', { opacity: 0, y: 12, duration: 0.7, ease: 'power2.out' }, 0.9)
    tl.from('[data-hero-scroll]', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 1.2)

    tl.call(() => {
      gsap.to('[data-hero-scroll]', {
        y: -8, opacity: 0.4, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
    })
  }, [])

  return null
}
