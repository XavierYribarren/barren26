'use client'
import Link from 'next/link'
import { useTranslation } from '../../i18n'
import styles from './NeedSection.module.css'

export default function NeedSection() {
  const { t, lang } = useTranslation()
  return (
    <section className={styles.section} id="need">
      <p className={styles.heading}>{t('need.heading')}</p>
      <div className={styles.buttons}>
        <Link href={`/${lang}/site-web`} className={styles.btn}>
          {t('need.siteWeb')}
        </Link>
        <Link href={`/${lang}/web-app`} className={styles.btn}>
          {t('need.webApp')}
        </Link>
      </div>
    </section>
  )
}
