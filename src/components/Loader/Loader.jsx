'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { splitWords } from '../../utils/splitWords'
import { heroReady } from '../../lib/heroReady'
import styles from './Loader.module.css'

export default function Loader() {
  const overlayRef = useRef(null)
  const wordsRef   = useRef([])
  const [hidden, setHidden] = useState(false)

  // Avant le premier paint : cacher la barre de navigation + hero elements
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nav = document.querySelector('[data-nav]')
    if (nav) gsap.set(nav, { y: '-100%' })

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

    const nav = document.querySelector('[data-nav]')

    // Accueil : on attend aussi les lettres définitives du hero (scène 3D), 8 s au plus ; au-delà, la
    // page s'affiche avec le mot seul et les lettres 3D apparaissent en fondu dès qu'elles sont prêtes
    const hasHero = !!document.querySelector('[data-hero-paper]')
    Promise.all([
      new Promise(r => setTimeout(r, 700)),
      document.fonts.ready,
      hasHero ? Promise.race([heroReady, new Promise(r => setTimeout(r, 8000))]) : null,
    ]).then(() => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          setHidden(true)
          runIntro(nav, wordsRef.current)
        },
      })
    })
  }, [])

  if (hidden) return null

  return (
    <div ref={overlayRef} className={styles.overlay} data-loader>
      <span className={styles.logo}>BARREN</span>
      <div className={styles.track}>
        <div className={styles.fill} />
      </div>
    </div>
  )
}

function runIntro(nav, words) {
  const tl = gsap.timeline()

  if (nav) tl.to(nav, { y: '0%', duration: 1, ease: 'expo.out' }, 0)

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
