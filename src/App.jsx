import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { splitWords } from './utils/splitWords'
import Sidebar from './components/Sidebar/Sidebar'
import Hero from './components/Hero/Hero'
import Services from './components/Services/Services'
import Projects from './components/Projects/Projects'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import DevColorTweaker from './components/DevColorTweaker/DevColorTweaker'
import ScrollProgress from './components/ScrollProgress/ScrollProgress'
import styles from './App.module.css'

const isDev = import.meta.env.DEV
const noMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function App() {
  const loadedRef = useRef(false)

  // Set sidebar off-screen before first paint to prevent flash
  useLayoutEffect(() => {
    if (!noMotion()) {
      const sidebar = document.querySelector('[data-sidebar]')
      if (sidebar) gsap.set(sidebar, { x: '-100%' })
    }
  }, [])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    if (noMotion()) return

    const tl = gsap.timeline()

    // 1. Sidebar slides in from left
    const sidebar = document.querySelector('[data-sidebar]')
    if (sidebar) tl.to(sidebar, { x: '0%', duration: 1, ease: 'expo.out' }, 0)

    // 2. Hero headline — split words, each rises from below
    const headline = document.querySelector('[data-hero-headline]')
    if (headline) {
      const words = splitWords(headline)
      tl.from(words, { y: '100%', duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0.15)
    }

    // 3. Hero label fades in
    tl.from('[data-hero-label]', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.6)

    // 4. Hero subline fades in
    tl.from('[data-hero-subline]', { opacity: 0, y: 12, duration: 0.7, ease: 'power2.out' }, 0.9)

    // 5. Scroll hint fades in last
    tl.from('[data-hero-scroll]', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 1.2)

    // 6. Subtle float loop on scroll hint
    tl.call(() => {
      gsap.to('[data-hero-scroll]', {
        y: -8,
        opacity: 0.4,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })
  }, [])

  return (
    <div className={styles.layout}>
      <ScrollProgress />
      <Sidebar />
      <main className={styles.main}>
        <Hero />
        <Services />
        <Projects />
        <About />
        <Contact />
      </main>
      {isDev && <DevColorTweaker isDev={isDev} />}
    </div>
  )
}

export default App
