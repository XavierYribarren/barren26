import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import ProjectModal from './ProjectModal'
import styles from './Projects.module.css'

gsap.registerPlugin(ScrollTrigger)

// Project names are brand names — stay in English in both languages
const projects = [
  {
    name: 'Pizza',
    category: 'Web Design',
    desk: '/projects/pizzdesk.png',
    mob:  '/projects/pizzmob.png',
    description: 'A full online presence for a local pizza restaurant — menu, ordering flow, and brand identity built from scratch.',
    role: 'Designer & Developer',
    stack: ['React', 'CSS Modules', 'Figma'],
    url: null,
  },
  {
    name: 'Tweakasix',
    category: 'Development',
    desk: '/projects/screen_tweakasixcol.webp',
    mob:  null,
    description: 'A customisation tool that lets users fine-tune interface colours in real time with a clean, minimal UI.',
    role: 'Developer',
    stack: ['React', 'CSS Custom Properties'],
    url: null,
  },
  {
    name: 'Jewelry',
    category: 'Web Design',
    desk: '/projects/heliasdesk.png',
    mob:  '/projects/heliasmob.png',
    description: 'Elegant e-commerce experience for a jewelry brand — product showcase, lookbook, and checkout flow.',
    role: 'Designer & Developer',
    stack: ['React', 'Figma'],
    url: null,
  },
  {
    name: 'Psychologis',
    category: 'Web Design',
    desk: '/projects/coradesk.png',
    mob:  '/projects/coramob.png',
    description: 'A calm, trust-building website for a psychologist practice — appointment booking and service overview.',
    role: 'Designer & Developer',
    stack: ['React', 'Figma'],
    url: null,
  },
  {
    name: 'Webamp',
    category: 'Development',
    desk: '/projects/screen_webamp.webp',
    mob:  null,
    description: 'A web-based recreation of the classic Winamp media player — faithful UI with functional audio playback.',
    role: 'Developer',
    stack: ['JavaScript', 'Web Audio API', 'CSS'],
    url: null,
  },
  {
    name: 'Musicroom',
    category: 'Development',
    desk: '/projects/screen_musicroom.webp',
    mob:  null,
    description: 'A collaborative music listening room where users can queue tracks and listen in sync with others.',
    role: 'Developer',
    stack: ['React', 'Node.js', 'WebSockets'],
    url: null,
  },
]

function Projects() {
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
          <div key={p.name} className={styles.card} onClick={() => setActive(p)}>
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
