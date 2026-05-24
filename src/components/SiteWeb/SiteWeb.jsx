'use client'
import { useTranslation } from '../../i18n'
import { siteWebTranslations } from '../../lib/siteWeb'
import ContactForm from '../ContactForm/ContactForm'
import styles from './SiteWeb.module.css'

export default function SiteWeb() {
  const { lang } = useTranslation()
  const d = siteWebTranslations[lang] ?? siteWebTranslations.fr

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.heroLabel}>{d.hero.label}</p>
        <h1 className={styles.heroHeadline}>{d.hero.headline}</h1>
        <p className={styles.heroSubline}>{d.hero.subline}</p>
      </section>

      {/* ── Intro ── */}
      <section className={styles.section}>
        <p className={styles.sectionLabel}>01</p>
        <h2 className={styles.sectionHeading}>{d.intro.heading}</h2>
        <div className={styles.introParagraphs}>
          {d.intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {/* ── Included ── */}
      <section className={styles.section}>
        <p className={styles.sectionLabel}>02</p>
        <h2 className={styles.sectionHeading}>{d.included.heading}</h2>
        <p className={styles.sectionSubheading}>{d.included.subheading}</p>
        <div className={styles.itemsGrid}>
          {d.included.items.map((item) => (
            <div key={item.number} className={styles.item}>
              <p className={styles.itemNumber}>{item.number}</p>
              <p className={styles.itemTitle}>{item.title}</p>
              <p className={styles.itemDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Options ── */}
      <section className={styles.section}>
        <p className={styles.sectionLabel}>03</p>
        <h2 className={styles.sectionHeading}>{d.options.heading}</h2>
        <ul className={styles.optionsList}>
          {d.options.items.map((opt) => (
            <li key={opt.title} className={styles.optionItem}>
              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionDescription}>{opt.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Contact ── */}
      <section className={styles.section}>
        <ContactForm type="site" />
      </section>

    </div>
  )
}
