import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import styles from './Services.module.css'

gsap.registerPlugin(ScrollTrigger)

const cardMotion = [
  { x: -40, y: 0,  delay: 0 },
  { x: 0,  y: 60,  delay: 0.15 },
  { x: -40, y: 0,  delay: 0.1 },
  { x: 0,  y: 60,  delay: 0.25 },
]

function Services() {
  const { t, lang } = useTranslation()
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const cardsRef   = useRef([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(labelRef.current, {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      })

      cardsRef.current.forEach((card, i) => {
        const { x, y, delay } = cardMotion[i]
        gsap.from(card, {
          opacity: 0, x, y, duration: 0.8, ease: 'power2.out', delay,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const items = t('services.items')

  return (
    <section id="services" className={styles.services} ref={sectionRef}>
      <span className={styles.label} ref={labelRef}>
        <span key={lang} className="langSwap">{t('services.sectionLabel')}</span>
      </span>
      <div className={styles.list}>
        {items.map((card, i) => (
          <div
            key={card.number}
            className={styles.row}
            ref={(el) => (cardsRef.current[i] = el)}
          >
            <span className={styles.number}>{card.number}</span>
            <h3 className={styles.title}>
              <span key={lang} className="langSwap">{card.title}</span>
            </h3>
            <p className={styles.description}>
              <span key={lang} className="langSwap">{card.description}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Services
