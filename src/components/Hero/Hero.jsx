'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import { setHeroProgress } from '../../lib/heroProgress'
import HeroArt, { ART, xId, yId } from './HeroArt'
import styles from './Hero.module.css'

// Three.js chargé à part : n'alourdit pas le premier rendu (le SVG s'affiche en attendant)
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const MOBILE_BAR = 60

function Hero() {
  const { t, lang } = useTranslation()
  const stageRef = useRef(null)
  const floodRef = useRef(null)
  const labelRef = useRef(null)
  const copyRef = useRef(null)
  const reelRef = useRef(null)
  const capRef = useRef(null)
  const videoRef = useRef(null)
  const sceneApi = useRef(null)
  const progressRef = useRef(0)
  const scene3dRef = useRef(false)
  const [scene3d, setScene3d] = useState(false)

  const onSceneReady = useCallback(() => {
    scene3dRef.current = true
    setScene3d(true)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const video = videoRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Vidéo : rien d'autre que les métadonnées tant qu'elle n'est pas sur le point d'être vue
    let wanted = false
    let stageVisible = true
    const syncVideo = () => {
      if (wanted && stageVisible) {
        if (video.paused) video.play().catch(() => {})
      } else if (!video.paused) {
        video.pause()
      }
    }

    // Sans animation : la nav suit seulement « sur le papier » ou non ; la vidéo est un bloc sous le hero
    if (reduced) {
      const paper = stage.querySelector('[data-hero-paper]')
      const onScroll = () => setHeroProgress(paper.getBoundingClientRect().bottom > 84 ? 0 : 1)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      const io = new IntersectionObserver(([entry]) => {
        wanted = entry.isIntersecting
        syncVideo()
      }, { rootMargin: '200px 0px' })
      io.observe(reelRef.current)
      return () => {
        window.removeEventListener('scroll', onScroll)
        io.disconnect()
        setHeroProgress(null)
      }
    }

    // Scène hors de l'écran (après le hero) : pause
    const io = new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting
      syncVideo()
    })
    io.observe(stage)

    const fronts = [...stage.querySelectorAll('[data-hero-neg-front]')]
    const negs = [...stage.querySelectorAll('[data-hero-neg-all]')]
    const setT = (id, tr) => document.getElementById(id)?.setAttribute('transform', tr)

    // Valeurs reprises de docs-mockup/direction-A-transition.html (fonction update)
    const render = (p) => {
      progressRef.current = p
      sceneApi.current?.update(p)
      const e = ease(clamp(p / 0.5))
      // Le SVG n'est plus visible une fois la 3D prête : inutile de le transformer
      if (!scene3dRef.current) for (const v of ['d', 'm']) {
        const c = ART[v]
        const s = 1 + (c.smax - 1) * e
        c.x.r.forEach((r, i) =>
          setT(xId(v, i), `translate(${c.x.tx} ${c.x.ty}) rotate(${c.x.rot * (1 - e)}) scale(${s}) rotate(${r})`))
        const sy = Math.max(0.0001, 1 - clamp(p / 0.28))
        c.y.parts.forEach((part, i) =>
          setT(yId(v, i), `translate(${c.y.tx + 260 * (1 - sy)} ${c.y.ty}) rotate(${c.y.rot}) scale(${sy}) rotate(${part.r})`))
      }
      if (!scene3dRef.current) {
        const negOpacity = clamp((p - 0.06) / 0.22) * (1 - clamp((p - 0.44) / 0.1))
        negs.forEach((n) => { n.style.opacity = negOpacity })
        fronts.forEach((n) => { n.style.opacity = 1 - clamp((p - 0.44) / 0.1) })
      }
      floodRef.current.style.opacity = clamp((p - 0.22) / 0.26)
      const fade = clamp(1 - p / 0.2)
      labelRef.current.style.opacity = fade
      copyRef.current.style.opacity = fade
      const q = ease(clamp((p - 0.5) / 0.42))
      reelRef.current.style.visibility = q > 0 ? 'visible' : 'hidden'
      reelRef.current.style.clipPath = `inset(${(1 - q) * 50}% ${(1 - q) * 50}%)`
      capRef.current.style.opacity = clamp((q - 0.75) / 0.25)
      // Lecture juste avant l'ouverture (p = .5), pause en revenant sur le papier
      if (p >= 0.4) wanted = true
      else if (p < 0.35) wanted = false
      syncVideo()
      setHeroProgress(p)
    }

    gsap.registerPlugin(ScrollTrigger)
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches
    const st = ScrollTrigger.create({
      trigger: stage,
      // Mobile : la scène commence sous la barre fixe de 60px
      start: () => (isMobile() ? `top ${MOBILE_BAR}px` : 'top top'),
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    })
    render(st.progress)

    return () => {
      st.kill()
      io.disconnect()
      setHeroProgress(null)
    }
  }, [])

  return (
    <section id="home" className={styles.stage} ref={stageRef}>
      <div className={styles.sticky}>
        <div className={`${styles.paper} ${scene3d ? styles.with3d : ''}`} data-hero-paper>
          <div className={styles.flood} ref={floodRef} />
          <h1 className="sr-only">Barren</h1>
          <HeroArt />
          <HeroScene apiRef={sceneApi} progressRef={progressRef} onReady={onSceneReady} />

          <div key={lang} className={`${styles.labelWrap} langSwap`} ref={labelRef}>
            <p className={styles.label} data-hero-label suppressHydrationWarning>{t('hero.label')}</p>
          </div>

          <div key={`${lang}-copy`} className={`${styles.copy} langSwap`} ref={copyRef}>
            <h2 className={styles.claim} data-hero-headline suppressHydrationWarning>{t('hero.headline')}</h2>
            <p className={styles.sub} data-hero-subline suppressHydrationWarning>{t('hero.subline')}</p>
          </div>
        </div>

        {/* Showreel : s'ouvre depuis le centre (clip-path piloté par le scroll) */}
        <figure className={styles.reel} ref={reelRef}>
          <video
            ref={videoRef}
            className={styles.video}
            src="/showreel.mp4"
            poster="/showreel-poster.jpg"
            preload="metadata"
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <figcaption className={styles.cap} ref={capRef}>{t('hero.reelCaption')}</figcaption>
        </figure>
      </div>
    </section>
  )
}

export default Hero
