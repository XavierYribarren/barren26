import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import styles from './Projects.module.css'

gsap.registerPlugin(ScrollTrigger)

// Project names are brand names — stay in English in both languages
const projects = [
  { name: 'Meridian', category: 'Web Design' },
  { name: 'Volta',    category: 'Branding' },
  { name: 'Sable',    category: 'Development' },
  { name: 'Crest',    category: 'UI/UX' },
  { name: 'Lune',     category: 'Digital Strategy' },
]

function Projects() {
  const { t, lang } = useTranslation()
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const stripRef   = useRef(null)

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
          <div key={p.name} className={styles.card}>
            <div className={styles.image} />
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
    </section>
  )
}

export default Projects
