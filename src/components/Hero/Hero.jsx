import { useTranslation } from '../../i18n'
import BComponent from './BComponent'
import styles from './Hero.module.css'

function Hero() {
  const { t, lang } = useTranslation()

  return (
    <section id="home" className={styles.hero}>
      <video
        className={styles.heroBg}
        src="/202605181331 (1).mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div key={lang} className={`${styles.left} langSwap`}>
        <h1 className={styles.titleName}>
          <span>Barren</span>
        </h1>
      </div>

      <video
        className={styles.mobileVideo}
        src="/202605181331 (1).mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div key={`${lang}-sub`} className={`${styles.subtitles} langSwap`}>
        <span className={styles.label} data-hero-label>{t('hero.label')}</span>
        <h2 className={styles.headline} data-hero-headline>{t('hero.headline')}</h2>
        <p className={styles.subline} data-hero-subline>{t('hero.subline')}</p>
      </div>

      <div className={styles.scrollHint} data-hero-scroll>
        {/* <span key={lang} className="langSwap">{t('hero.cta')}</span> */}
      </div>
    </section>
  )
}

export default Hero
