'use client'
import { useTranslation } from '../../i18n'
import HeroArt from './HeroArt'
import styles from './Hero.module.css'

function Hero() {
  const { t, lang } = useTranslation()

  return (
    <section id="home" className={styles.stage}>
      <div className={styles.sticky}>
        <h1 className="sr-only">Barren</h1>
        <HeroArt />

        <div key={lang} className={`${styles.labelWrap} langSwap`}>
          <p className={styles.label} data-hero-label suppressHydrationWarning>{t('hero.label')}</p>
        </div>

        <div key={`${lang}-copy`} className={`${styles.copy} langSwap`}>
          <h2 className={styles.claim} data-hero-headline suppressHydrationWarning>{t('hero.headline')}</h2>
          <p className={styles.sub} data-hero-subline suppressHydrationWarning>{t('hero.subline')}</p>
        </div>
      </div>
    </section>
  )
}

export default Hero
