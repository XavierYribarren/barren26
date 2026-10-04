'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../i18n'
import SanityImage from '../SanityImage/SanityImage'
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

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.box}
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose} aria-label={closeLabel}>✕</button>

        <div className={styles.images}>
          <SanityImage className={styles.desk} image={project.deskImage} alt={project.name} sizes="(max-width: 780px) 100vw, 700px" />
          {project.mobImage && (
            <SanityImage className={styles.mob} image={project.mobImage} alt={`${project.name} mobile`} sizes="(max-width: 768px) 18vw, 112px" />
          )}
        </div>

        <div className={styles.info}>
          <h2 id="modal-title" className={styles.name}>{project.name}</h2>
          <span className={styles.category}>{project.category}</span>

          <p className={styles.description}>{project.description}</p>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{t('projects.modal.role')}</span>
              <span className={styles.metaValue}>{project.role}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{t('projects.modal.stack')}</span>
              <div className={styles.stack}>
                {project.stack.map((s) => (
                  <span key={s} className={styles.tag}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className={styles.siteLink}
              aria-label={`${t('projects.modal.visit')} (${lang === 'en' ? 'opens in new tab' : 'nouvel onglet'})`}
            >
              {t('projects.modal.visit')}
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ProjectModal
