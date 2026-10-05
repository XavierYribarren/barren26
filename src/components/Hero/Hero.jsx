'use client'
import { useTranslation } from '../../i18n'
import styles from './Hero.module.css'

function Hero() {
  const { t, lang } = useTranslation()

  return (
    <section id="home" className={styles.hero}>
      <div key={lang} className={`${styles.left} langSwap`}>
        <h1 className={styles.titleName}>
          <span>Barren</span>
        </h1>
      </div>

      {/* Une seule vidéo : plein cadre derrière le texte sur desktop, dans le flux sur mobile */}
      <video
        className={styles.video}
        src="/202605181331 (1).mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div key={`${lang}-sub`} className={`${styles.subtitles} langSwap`}>
        <span className={styles.label} data-hero-label suppressHydrationWarning>{t('hero.label')}</span>
        <h2 className={styles.headline} data-hero-headline suppressHydrationWarning>{t('hero.headline')}</h2>
        <p className={styles.subline} data-hero-subline suppressHydrationWarning>{t('hero.subline')}</p>
      </div>

      <div className={styles.scrollHint} data-hero-scroll suppressHydrationWarning>
        {/* <span key={lang} className="langSwap">{t('hero.cta')}</span> */}
      </div>
    </section>
  )
}

export default Hero
