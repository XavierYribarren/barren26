import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, locales } from '../../../../src/lib/i18n'
import { sanityFetch } from '../../../../src/lib/sanity/client'
import { PROJECT_BY_SLUG_QUERY, PROJECT_SLUGS_QUERY } from '../../../../src/lib/sanity/queries'
import { toLegacyProject } from '../../../../src/lib/sanity/adapters'
import SanityImage from '../../../../src/components/SanityImage/SanityImage'
import styles from './ProjectPage.module.css'

// Un projet ajouté dans Sanity après le build est rendu à la demande puis mis en cache
export const dynamicParams = true

async function getProject(slug, locale) {
  const project = await sanityFetch(PROJECT_BY_SLUG_QUERY, { slug, locale })
  return project ? toLegacyProject(project) : null
}

export async function generateStaticParams() {
  const slugs = await sanityFetch(PROJECT_SLUGS_QUERY)
  return locales.flatMap(locale =>
    slugs.map(({ slug }) => ({ locale, slug }))
  )
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const p = await getProject(slug, locale)
  if (!p) return { title: 'Barren' }
  const title = `${p.name} — Barren`
  const description = p.description
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
  const p = await getProject(slug, locale)

  if (!p) notFound()

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
        <SanityImage className={styles.desk} image={p.deskImage} alt={p.name} sizes="(max-width: 1100px) 100vw, 900px" />
        {p.mobImage && (
          <SanityImage className={styles.mob} image={p.mobImage} alt={`${p.name} mobile`} sizes="180px" />
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
