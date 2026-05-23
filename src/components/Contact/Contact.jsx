'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { splitWords } from '../../utils/splitWords'
import { useTranslation } from '../../i18n'
import styles from './Contact.module.css'

function Contact() {
  const { t, lang } = useTranslation()
  const sectionRef  = useRef(null)
  const headlineRef = useRef(null)
  const restRef     = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 85%', once: true }

      const words = splitWords(headlineRef.current)
      gsap.from(words, {
        y: '100%', duration: 0.9, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: trigger,
      })

      gsap.from(Array.from(restRef.current.children), {
        opacity: 0, y: 50, duration: 0.8, ease: 'power2.out', stagger: 0.12, delay: 0.3,
        scrollTrigger: trigger,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" className={styles.contact} ref={sectionRef}>
      {/* headline kept outside key wrapper so the headlineRef stays stable for splitWords */}
      <h2 className={styles.headline} ref={headlineRef}>{t('contact.headline')}</h2>

      <div className={styles.rest} ref={restRef}>
        <p key={lang} className={`${styles.subline} langSwap`}>{t('contact.subline')}</p>

        <a href="mailto:xavier.yribarren@gmail.com" className={styles.email}>
          xavier.yribarren@gmail.com
        </a>

        <div className={styles.socials}>
          <a href="https://www.linkedin.com/in/xavier-yribarren" target="_blank" rel="noreferrer" className={styles.socialLink}>LinkedIn</a>
          <a href="mailto:xavier.yribarren@gmail.com" className={styles.socialLink}>Mail</a>
          <a href="https://www.malt.fr/profile/xavieryribarren" target="_blank" rel="noreferrer" className={styles.socialLink}>Malt</a>
        </div>
      </div>

      <p key={`footer-${lang}`} className={`${styles.copy} langSwap`}>{t('contact.footer')}</p>
    </section>
  )
}

export default Contact
