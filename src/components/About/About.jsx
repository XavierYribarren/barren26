import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from '../../i18n'
import styles from './About.module.css'

gsap.registerPlugin(ScrollTrigger)

function About() {
  const { t, lang } = useTranslation()
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const textRef    = useRef(null)
  const imageRef   = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 85%', once: true }

      gsap.from(labelRef.current, {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: trigger,
      })

      gsap.from(textRef.current, {
        opacity: 0, y: 50, duration: 0.8, ease: 'power2.out', delay: 0.1,
        scrollTrigger: trigger,
      })

      gsap.from(imageRef.current, {
        scale: 1.05, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.2,
        scrollTrigger: trigger,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const paragraphs = t('about.paragraphs')

  return (
    <section id="about" className={styles.about} ref={sectionRef}>
      <span className={styles.label} ref={labelRef}>
        <span key={lang} className="langSwap">{t('about.sectionLabel')}</span>
      </span>
      <div className={styles.grid}>
        <div className={styles.text} ref={textRef}>
          <h2 key={lang} className={`${styles.heading} langSwap`}>{t('about.heading')}</h2>
          <div className={styles.paragraphs}>
            {paragraphs.map((para, i) => (
              <p key={`${lang}-${i}`} className={`${styles.body} langSwap`}>{para}</p>
            ))}
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <img
            src="/IMG_linkedin.png"
            alt="Barren"
            className={styles.image}
            ref={imageRef}
          />
        </div>
      </div>
    </section>
  )
}

export default About
