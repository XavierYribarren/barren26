'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { splitWords } from '../../utils/splitWords'
import styles from './Loader.module.css'

export default function Loader() {
  const overlayRef = useRef(null)
  const wordsRef   = useRef([])
  const [hidden, setHidden] = useState(false)

  // Avant le premier paint : cacher sidebar + hero elements
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sidebar = document.querySelector('[data-sidebar]')
    if (sidebar) gsap.set(sidebar, { x: '-100%' })

    gsap.set('[data-hero-label]',   { opacity: 0 })
    gsap.set('[data-hero-subline]', { opacity: 0, y: 12 })
    gsap.set('[data-hero-scroll]',  { opacity: 0 })

    const headline = document.querySelector('[data-hero-headline]')
    if (headline) {
      wordsRef.current = splitWords(headline)
      gsap.set(wordsRef.current, { y: '100%' })
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sidebar = document.querySelector('[data-sidebar]')

    Promise.all([
      new Promise(r => setTimeout(r, 700)),
      document.fonts.ready,
    ]).then(() => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          setHidden(true)
          runIntro(sidebar, wordsRef.current)
        },
      })
    })
  }, [])

  if (hidden) return null

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <span className={styles.logo}>BARREN</span>
      <div className={styles.track}>
        <div className={styles.fill} />
      </div>
    </div>
  )
}

function runIntro(sidebar, words) {
  const tl = gsap.timeline()

  if (sidebar) tl.to(sidebar, { x: '0%', duration: 1, ease: 'expo.out' }, 0)

  if (words.length) {
    tl.to(words, { y: '0%', duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0.15)
  }

  tl.to('[data-hero-label]',   { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.6)
  tl.to('[data-hero-subline]', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.9)
  tl.to('[data-hero-scroll]',  { opacity: 1, duration: 0.7, ease: 'power2.out' }, 1.2)

  tl.call(() => {
    gsap.to('[data-hero-scroll]', {
      y: -8, opacity: 0.4, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
  })
}
