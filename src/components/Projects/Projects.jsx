'use client'
import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import ProjectModal from './ProjectModal'
import SanityImage from '../SanityImage/SanityImage'
import { tagLabel, usedTags } from '../../lib/tags'
import { cardBackground } from '../../lib/theme'
import styles from './Projects.module.css'

function Projects({ projects = [] }) {
  const { t, lang } = useTranslation()
  const sectionRef  = useRef(null)
  const labelRef    = useRef(null)
  const stripRef    = useRef(null)
  const [active, setActive] = useState(null)
  const [tagFilter, setTagFilter] = useState(null)
  const isFirstFilter = useRef(true)

  const tags = useMemo(() => usedTags(projects), [projects])
  // Un tag disparu après revalidation retombe sur « Tous »
  const currentTag = tags.includes(tagFilter) ? tagFilter : null
  const visible = currentTag ? projects.filter(p => p.tags?.includes(currentTag)) : projects

  const handleWheel = useCallback((e) => {
    const strip = stripRef.current
    // Rien à faire défiler (peu de cartes) : on laisse la page défiler normalement
    if (strip.scrollWidth <= strip.clientWidth) return
    e.preventDefault()
    // Lenis ne regarde pas defaultPrevented : ce marqueur l'empêche de faire défiler la page en même temps
    e.lenisStopPropagation = true
    strip.scrollLeft += e.deltaY
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    strip.addEventListener('wheel', handleWheel, { passive: false })
    return () => strip.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(labelRef.current, {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      })

      gsap.from(Array.from(stripRef.current.children), {
        opacity: 0, x: 60, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Changement de filtre : retour au début de la bande, fondu des cartes, recalcul des ScrollTrigger
  useEffect(() => {
    if (isFirstFilter.current) {
      isFirstFilter.current = false
      return
    }
    stripRef.current.scrollLeft = 0
    ScrollTrigger.refresh()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(Array.from(stripRef.current.children),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.04, overwrite: 'auto' },
      )
    }, stripRef)
    return () => ctx.revert()
  }, [currentTag])

  return (
    <section id="projects" className={styles.projects} ref={sectionRef}>
      <span className={styles.label} ref={labelRef}>
        <span key={lang} className="langSwap">{t('projects.sectionLabel')}</span>
      </span>

      {tags.length > 0 && (
        <div className={styles.filters} role="group" aria-label={t('projects.filter.label')}>
          {[null, ...tags].map((tag) => (
            <button
              key={tag ?? 'all'}
              type="button"
              className={styles.filter}
              aria-pressed={currentTag === tag}
              onClick={() => setTagFilter(tag)}
            >
              <span key={lang} className="langSwap">
                {tag ? tagLabel(tag, lang) : t('projects.filter.all')}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.strip} ref={stripRef}>
        {visible.map((p) => (
          <div
            key={p.id}
            className={styles.card}
            style={cardBackground(p.theme) ? { '--card-bg': cardBackground(p.theme) } : undefined}
            role="button"
            tabIndex={0}
            onClick={() => setActive(p)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(p) } }}
          >
            <div className={styles.imageWrap}>
              <SanityImage className={styles.image} image={p.deskImage} alt={p.name} sizes="(max-width: 768px) 220px, 320px" fit="contain" />
              {p.mobImage && <SanityImage className={styles.mobile} image={p.mobImage} alt={`${p.name} mobile`} sizes="(max-width: 768px) 50px, 72px" />}
            </div>
            <h3 className={styles.name}>{p.name}</h3>
            <span className={styles.category}>{p.category}</span>
          </div>
        ))}
      </div>

      <div className={styles.viewAll}>
        <a href="#" className={styles.viewAllLink}>
          <span key={lang} className="langSwap">{t('projects.cta')}</span>
        </a>
      </div>

      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </section>
  )
}

export default Projects
