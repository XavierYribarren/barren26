'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../i18n'
import SanityImage from '../SanityImage/SanityImage'
import { modalThemeVars } from '../../lib/theme'
import { getLenis } from '../../lib/smoothScroll'
import styles from './ProjectModal.module.css'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

// onPrev / onNext : projet précédent / suivant (null s'il n'y en a qu'un) ; position : [rang, total]
function ProjectModal({ project, onClose, onPrev, onNext, position }) {
  const { t, lang } = useTranslation()
  const boxRef = useRef(null)
  const scrollRef = useRef(null)
  const returnFocusRef = useRef(null)
  const touchRef = useRef(null)

  // Nouveau projet : le texte repart du haut
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    if (boxRef.current) boxRef.current.scrollTop = 0
  }, [project.id])

  // Swipe horizontal (tactile) : projet précédent / suivant
  const onTouchStart = (e) => {
    const p = e.touches[0]
    touchRef.current = { x: p.clientX, y: p.clientY }
  }
  const onTouchEnd = (e) => {
    const start = touchRef.current
    touchRef.current = null
    if (!start) return
    const p = e.changedTouches[0]
    const dx = p.clientX - start.x
    const dy = p.clientY - start.y
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) onNext?.()
    else onPrev?.()
  }

  useEffect(() => {
    returnFocusRef.current = document.activeElement
    // Seule la modale défile : la page est bloquée sur <html> (le vrai conteneur de défilement) et
    // <body> ; la largeur de la barre de défilement est compensée pour que la page ne bouge pas
    const html = document.documentElement
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    getLenis()?.stop()
    boxRef.current?.querySelector('button')?.focus()
    return () => {
      html.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      getLenis()?.start()
      returnFocusRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight' && onNext) { onNext(); return }
      if (e.key === 'ArrowLeft' && onPrev) { onPrev(); return }
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
  }, [onClose, onPrev, onNext])

  const closeLabel = lang === 'en' ? 'Close dialog' : 'Fermer'
  const prevLabel = lang === 'en' ? 'Previous project' : 'Projet précédent'
  const nextLabel = lang === 'en' ? 'Next project' : 'Projet suivant'
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
        data-lenis-prevent
        aria-modal="true"
        aria-labelledby="modal-title"
        style={themeVars}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button className={styles.close} onClick={onClose} aria-label={closeLabel}>✕</button>

        {/* Navigation entre projets (aussi au swipe et aux flèches du clavier) */}
        {onPrev && onNext && (
          <div className={styles.pager}>
            <button type="button" className={styles.pagerBtn} onClick={onPrev} aria-label={prevLabel}>‹</button>
            <span className={styles.pagerCount} aria-live="polite">{position[0]} / {position[1]}</span>
            <button type="button" className={styles.pagerBtn} onClick={onNext} aria-label={nextLabel}>›</button>
          </div>
        )}

        {/* Partie fixe : visuels et en-tête */}
        <div className={styles.top}>

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
        </div>

        {/* Partie défilante : le texte */}
        <div className={styles.info} ref={scrollRef}>
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
