import { useTranslation } from '../../i18n'
import BComponent from './BComponent'
import styles from './Hero.module.css'

function Hero() {
  const { t, lang } = useTranslation()

  return (
    <section id="home" className={styles.hero}>
      <video
        className={styles.heroCanvas}
        src="/202605181331 (1).mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* key={lang} remounts this block on language change, triggering langSwap animation */}
      <div key={lang} className={`${styles.content} langSwap`}>
      <div >
         <h1 className={styles.titleName}>
          {/* <BComponent width={"20%"} height={"40%"}/> */}
          <span>Barren</span></h1>
        </div>
        <div className={styles.subtitles}>
        <span className={styles.label} data-hero-label>{t('hero.label')}</span>
        <h2 className={styles.headline} data-hero-headline>{t('hero.headline')}</h2>
        <p className={styles.subline} data-hero-subline>{t('hero.subline')}</p>
        </div>
      </div>

      <div className={styles.scrollHint} data-hero-scroll>
        <span key={lang} className="langSwap">{t('hero.cta')}</span>
      </div>
    </section>
  )
}

export default Hero
