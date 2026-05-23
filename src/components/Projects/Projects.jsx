'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import ProjectModal from './ProjectModal'
import styles from './Projects.module.css'

const projectsStatic = [
  { id: 'restaurant',    desk: '/projects/pizzdesk.png',            mob: '/projects/pizzmob.png',   stack: ['Next.js', 'React', 'Sanity'],                                        url: null },
  { id: 'configurateur', desk: '/projects/screen_tweakasixcol.webp',mob: null,                      stack: ['Three.js', 'React', 'Redux', 'Node', 'MySQL'],                       url: null },
  { id: 'boutique',      desk: '/projects/heliasdesk.png',          mob: '/projects/heliasmob.png', stack: ['React', 'GSAP', 'Shopify'],                                          url: null },
  { id: 'psychologue',   desk: '/projects/coradesk.png',            mob: '/projects/coramob.png',   stack: ['React', 'GSAP', 'Leaflet'],                                          url: null },
  { id: 'webamp',        desk: '/projects/screen_webamp.webp',      mob: null,                      stack: ['Three.js', 'Faust', 'WebAssembly', 'React'],                         url: null },
  { id: 'musicroom',     desk: '/projects/screen_musicroom.webp',   mob: null,                      stack: ['React', 'Three.js', 'React Three Fiber', 'Web Audio API', 'Blender'], url: null },
]

function Projects() {
  const { t, lang } = useTranslation()
  const projects = (t('projects.items') || []).map((text, i) => ({ ...projectsStatic[i], ...text }))
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
          <div key={p.id} className={styles.card} onClick={() => setActive(p)}>
            <div className={styles.imageWrap}>
              <img className={styles.image} src={p.desk} alt={p.name} />
              {p.mob && <img className={styles.mobile} src={p.mob} alt={`${p.name} mobile`} />}
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
