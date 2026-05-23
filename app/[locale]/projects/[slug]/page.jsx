import Link from 'next/link'
import { projects } from '../../../../src/lib/projects'
import { getTranslations, locales } from '../../../../src/lib/i18n'
import styles from './ProjectPage.module.css'

export function generateStaticParams() {
  return locales.flatMap(locale =>
    projects.map(p => ({ locale, slug: p.slug }))
  )
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const t = getTranslations(locale)
  const idx = projects.findIndex(p => p.slug === slug)
  if (idx === -1) return { title: 'Barren' }
  const item = t.projects.items[idx]
  const p = projects[idx]
  const title = `${item.name} — Barren`
  const description = item.description
  return {
    title,
    description,
    alternates: {
      canonical: `https://barren.dev/${locale}/projects/${slug}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `https://barren.dev/${l}/projects/${slug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `https://barren.dev/${locale}/projects/${slug}`,
      siteName: 'Barren',
      images: p.desk ? [{ url: p.desk }] : [],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: p.desk ? 'summary_large_image' : 'summary',
      title,
      description,
      images: p.desk ? [p.desk] : [],
    },
  }
}

export default async function ProjectPage({ params }) {
  const { locale, slug } = await params
  const t = getTranslations(locale)
  const idx = projects.findIndex(p => p.slug === slug)

  if (idx === -1) return <p>Projet introuvable</p>

  const p = { ...projects[idx], ...t.projects.items[idx] }
  const backLabel = locale === 'fr' ? '← Retour' : '← Back'
  const visitLabel = locale === 'fr' ? 'Voir le site →' : 'Visit site →'

  return (
    <div className={styles.page}>
      <Link href={`/${locale}#projects`} className={styles.back}>
        {backLabel}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.name}>{p.name}</h1>
        <span className={styles.category}>{p.category}</span>
      </header>

      <div className={styles.images}>
        <img className={styles.desk} src={p.desk} alt={p.name} />
        {p.mob && (
          <img className={styles.mob} src={p.mob} alt={`${p.name} mobile`} />
        )}
      </div>

      <div className={styles.meta}>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>{t.projects.modal.role}</span>
          <span className={styles.metaValue}>{p.role}</span>
        </div>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>{t.projects.modal.stack}</span>
          <ul className={styles.stack}>
            {p.stack.map(s => (
              <li key={s} className={styles.tag}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.description}>{p.description}</p>

      {p.url && (
        <a href={p.url} target="_blank" rel="noreferrer" className={styles.cta}>
          {visitLabel}
        </a>
      )}
    </div>
  )
}
