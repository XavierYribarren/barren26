'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { preload } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import { setHeroProgress } from '../../lib/heroProgress'
import { markHeroReady, heroIntro } from '../../lib/heroReady'
import HeroArt, { ART, xId, yId } from './HeroArt'
import styles from './Hero.module.css'

// Three.js chargé à part, mais dès l'évaluation de ce module côté client (pendant le loader), sans
// attendre le montage du hero
const loadHeroScene = () => import('./HeroScene')
const HeroScene = dynamic(loadHeroScene, { ssr: false })
if (typeof window !== 'undefined') loadHeroScene()

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
  const videoRef = useRef(null)
  const interludeRef = useRef(null)
  const sceneApi = useRef(null)
  const progressRef = useRef(0)
  const scene3dRef = useRef(false)
  const paperRef = useRef(null)
  // 'pending' : monolithes masqués, en attente de la 3D ; '3d' : scène prête ; 'svg' : repli
  const [art, setArt] = useState('pending')

  // Intro du landing : le mot devient opaque, puis X et Y entrent par les côtés (word, monoX, monoY ∈ [0, 1])
  const introRef = useRef({ word: 0, monoX: 0, monoY: 0 })
  const introCtl = useRef({ started: false, scene: false, monos: false })
  const applyIntro = useCallback(() => {
    sceneApi.current?.setIntro(introRef.current)
    paperRef.current?.style.setProperty('--hero-word', introRef.current.word)
  }, [])
  // Les lettres entrent quand l'intro a commencé ET que la scène est prête (si la 3D arrive en retard,
  // son entrée par les côtés fait partie de l'intro)
  const startMonos = useCallback(() => {
    const c = introCtl.current
    if (!c.started || !c.scene || c.monos) return
    c.monos = true
    gsap.timeline({ onUpdate: applyIntro })
      .to(introRef.current, { monoX: 1, duration: 1.6, ease: 'expo.out' }, 0.35)
      .to(introRef.current, { monoY: 1, duration: 1.6, ease: 'expo.out' }, 0.5)
  }, [applyIntro])

  const onSceneReady = useCallback(() => {
    scene3dRef.current = true
    setArt('3d')
    introCtl.current.scene = true
    startMonos()
    // Le loader ne se retire qu'une fois la 3D à l'écran (deux images plus tard)
    requestAnimationFrame(() => requestAnimationFrame(markHeroReady))
  }, [startMonos])

  const onSceneFallback = useCallback(() => {
    setArt((a) => (a === 'pending' ? 'svg' : a))
    introCtl.current.scene = true
    startMonos()
    markHeroReady()
  }, [startMonos])

  useEffect(() => {
    const intro = introRef.current
    const finish = () => {
      Object.assign(intro, { word: 1, monoX: 1, monoY: 1 })
      introCtl.current.monos = true
      applyIntro()
    }
    // Sans animation : tout est en place d'emblée
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    let alive = true
    heroIntro.then(() => {
      if (!alive) return
      introCtl.current.started = true
      // Page rechargée plus bas : pas d'intro
      if (progressRef.current > 0.02) {
        finish()
        return
      }
      gsap.to(intro, { word: 1, duration: 0.9, ease: 'power2.out', onUpdate: applyIntro })
      startMonos()
    })
    return () => { alive = false }
  }, [applyIntro, startMonos])

  // Filet de sécurité : sans 3D au bout de 15 s (échec de chargement), on affiche le repli SVG.
  // D'ici là le mot reste seul : jamais de barres SVG remplacées ensuite par les lettres 3D.
  useEffect(() => {
    const t = setTimeout(onSceneFallback, 15000)
    return () => clearTimeout(t)
  }, [onSceneFallback])

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
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches
    // Interlude sous le mot (phase noire) : centré sur BARREN, sous sa base. Mesuré sur
    // le mot SVG visible, qui a exactement le même cadrage que la scène 3D (même viewBox, même k/ox/oy)
    const interlude = interludeRef.current
    const placeInterlude = () => {
      const paperBox = stage.querySelector('[data-hero-paper]').getBoundingClientRect()
      const word = [...stage.querySelectorAll('[data-word]')].find((w) => w.getBoundingClientRect().width > 0)
      if (!word) return
      const box = word.getBoundingClientRect()
      const gap = isMobile() ? 28 : 40
      interlude.style.left = `${box.left - paperBox.left + box.width / 2}px`
      interlude.style.top = `${box.bottom - paperBox.top + gap}px`
    }
    let interludeShown = false

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
      if (isMobile()) {
        // Mobile (portrait) : la vidéo 16:9 est montrée entière ; le cadre s'ouvre jusqu'à une bande
        // pleine largeur au ratio de la vidéo, centrée, au lieu du plein écran
        const reel = reelRef.current
        const band = Math.max(0, (reel.offsetHeight - (reel.offsetWidth * 9) / 16) / 2)
        const half = reel.offsetHeight / 2
        const edge = (1 - q) * half + q * band
        reel.style.clipPath = `inset(${edge}px ${(1 - q) * 50}%)`
      } else {
        reelRef.current.style.clipPath = `inset(${(1 - q) * 50}% ${(1 - q) * 50}%)`
      }
      // Interlude : 0 → 1 sur p ∈ [.28, .34] (en remontant de 8px), 1 → 0 sur p ∈ [.42, .48]
      const iIn = clamp((p - 0.28) / 0.06)
      const iOpacity = iIn * (1 - clamp((p - 0.42) / 0.06))
      interlude.style.opacity = iOpacity
      interlude.style.transform = `translate(-50%, ${8 * (1 - iIn)}px)`
      if ((iOpacity > 0) !== interludeShown) {
        interludeShown = iOpacity > 0
        interlude.setAttribute('aria-hidden', String(!interludeShown))
      }
      // Lecture juste avant l'ouverture (p = .5), pause en revenant sur le papier
      if (p >= 0.4) wanted = true
      else if (p < 0.35) wanted = false
      syncVideo()
      setHeroProgress(p)
    }

    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: stage,
      // Mobile : la scène commence sous la barre fixe de 60px
      start: () => (isMobile() ? `top ${MOBILE_BAR}px` : 'top top'),
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => {
        placeInterlude()
        render(self.progress)
      },
    })
    render(st.progress)

    placeInterlude()
    const ro = new ResizeObserver(placeInterlude)
    ro.observe(stage.querySelector('[data-hero-paper]'))

    return () => {
      st.kill()
      ro.disconnect()
      io.disconnect()
      setHeroProgress(null)
    }
  }, [])

  // Le modèle des lettres X et Y, préchargé dès le HTML (même mode que le fetch de three.js)
  preload('/XY.glb', { as: 'fetch', crossOrigin: 'anonymous' })

  return (
    <section id="home" className={styles.stage} ref={stageRef}>
      <div className={styles.sticky}>
        <div
          className={[
            styles.paper,
            art === '3d' && styles.with3d,
            art === 'pending' && styles.artPending,
          ].filter(Boolean).join(' ')}
          ref={paperRef}
          data-hero-paper
        >
          <div className={styles.flood} ref={floodRef} />

          {/* Interlude de la phase noire, sous le mot (position et opacité pilotées par render) */}
          <div key={`${lang}-interlude`} className={styles.interlude} ref={interludeRef} aria-hidden="true">
            <p className={styles.interludeTitle}>{t('hero.interlude.title')}</p>
            <svg className={styles.interludeArrow} viewBox="0 0 14 14" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M7 1.5v10M2.5 7.5 7 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="sr-only">Barren</h1>
          <HeroArt />
          <HeroScene
            apiRef={sceneApi}
            progressRef={progressRef}
            introRef={introRef}
            onReady={onSceneReady}
            onFallback={onSceneFallback}
          />

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
        </figure>
      </div>
    </section>
  )
}

export default Hero
