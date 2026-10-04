'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../i18n'
import SanityImage from '../SanityImage/SanityImage'
import { modalThemeVars } from '../../lib/theme'
import styles from './ProjectModal.module.css'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

function ProjectModal({ project, onClose }) {
  const { t, lang } = useTranslation()
  const boxRef = useRef(null)
  const returnFocusRef = useRef(null)

  useEffect(() => {
    returnFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    boxRef.current?.querySelector('button')?.focus()
    return () => {
      document.body.style.overflow = ''
      returnFocusRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const els = Array.from(boxRef.current?.querySelectorAll(FOCUSABLE) ?? [])
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const closeLabel = lang === 'en' ? 'Close dialog' : 'Fermer'
  const themeVars = modalThemeVars(project.theme)

  const desk = project.deskImage
  const mob = project.mobImage
  // Largeurs proportionnelles aux ratios : le mobile fait ~70 % de la hauteur du desktop
  const ratio = (img) => (img?.width && img?.height ? img.width / img.height : null)
  const stageStyle = mob && ratio(desk) && ratio(mob)
    ? { '--desk-ratio': ratio(desk), '--mob-ratio': ratio(mob) }
    : undefined

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.box}
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={themeVars}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose} aria-label={closeLabel}>✕</button>

        <div className={`${styles.stage} ${mob ? styles.withMobile : ''}`} style={stageStyle}>
          <SanityImage
            className={styles.shot}
            image={desk}
            alt={project.name}
            sizes={mob ? '(max-width: 640px) 100vw, 620px' : '(max-width: 780px) 100vw, 740px'}
            fit="contain"
          />
          {mob && (
            <SanityImage
              className={`${styles.shot} ${styles.mobShot}`}
              image={mob}
              alt={`${project.name} mobile`}
              sizes="(max-width: 640px) 40vw, 110px"
              fit="contain"
            />
          )}
        </div>

        <div className={styles.info}>
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <h2 id="modal-title" className={styles.name}>{project.name}</h2>
              {project.category && <span className={styles.category}>{project.category}</span>}
            </div>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.visit}
                aria-label={`${t('projects.modal.visit')} (${lang === 'en' ? 'opens in new tab' : 'nouvel onglet'})`}
              >
                {t('projects.modal.visit')}
              </a>
            )}
          </header>

          {project.description && <p className={styles.lead}>{project.description}</p>}

          {project.highlights?.length > 0 && (
            <section className={styles.highlights} aria-labelledby="modal-highlights">
              <h3 id="modal-highlights" className={styles.sectionLabel}>{t('projects.modal.highlights')}</h3>
              <ul className={styles.highlightGrid}>
                {project.highlights.map((h, i) => (
                  <li key={i} className={styles.highlight}>
                    <strong className={styles.highlightTitle}>{h.title}</strong>
                    {h.benefit && <span className={styles.highlightBenefit}>{h.benefit}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(project.role || project.stack?.length > 0) && (
            <footer className={styles.meta}>
              {project.role && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.modal.role')}</span>
                  <span className={styles.metaValue}>{project.role}</span>
                </div>
              )}
              {project.stack?.length > 0 && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.modal.stack')}</span>
                  <div className={styles.stack}>
                    {project.stack.map((s) => (
                      <span key={s} className={styles.tag}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ProjectModal
