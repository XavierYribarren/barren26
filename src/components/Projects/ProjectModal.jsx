'use client'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../i18n'
import styles from './ProjectModal.module.css'

function ProjectModal({ project, onClose }) {
  const { t } = useTranslation()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleClose = onClose

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={handleClose} aria-label="Close">✕</button>

        <div className={styles.images}>
          <img className={styles.desk} src={project.desk} alt={project.name} />
          {project.mob && (
            <img className={styles.mob} src={project.mob} alt={`${project.name} mobile`} />
          )}
        </div>

        <div className={styles.info}>
          <h2 className={styles.name}>{project.name}</h2>
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
            <a href={project.url} target="_blank" rel="noreferrer" className={styles.siteLink}>
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
