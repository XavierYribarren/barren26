import { useTranslation } from '../../i18n'
import BComponent from './BComponent'
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

      <div className={styles.right}>
        <video
          className={styles.heroVideo}
          src="/202605181331 (1).mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

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
