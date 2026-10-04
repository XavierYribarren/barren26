'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import ProjectModal from './ProjectModal'
import SanityImage from '../SanityImage/SanityImage'
import styles from './Projects.module.css'

function Projects({ projects = [] }) {
  const { t, lang } = useTranslation()
  const sectionRef  = useRef(null)
  const labelRef    = useRef(null)
  const stripRef    = useRef(null)
  const [active, setActive] = useState(null)

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    stripRef.current.scrollLeft += e.deltaY
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

  return (
    <section id="projects" className={styles.projects} ref={sectionRef}>
      <span className={styles.label} ref={labelRef}>
        <span key={lang} className="langSwap">{t('projects.sectionLabel')}</span>
      </span>

      <div className={styles.strip} ref={stripRef}>
        {projects.map((p) => (
          <div
            key={p.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => setActive(p)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(p) } }}
          >
            <div className={styles.imageWrap}>
              <SanityImage className={styles.image} image={p.deskImage} alt={p.name} sizes="(max-width: 768px) 220px, 320px" />
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
