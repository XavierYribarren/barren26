'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
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
  const slideRef = useRef(null)
  // slideRef : enveloppe de la boîte, c'est toute la modale qui glisse (l'animation CSS d'ouverture de la
  // boîte écraserait un transform posé sur la boîte elle-même)
  // Sens du dernier changement (1 : suivant, -1 : précédent) pour faire entrer le nouveau projet
  const enterDir = useRef(0)
  const busy = useRef(false)

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const goRef = useRef(null)

  // Rotation légère qui suit le déplacement, comme une carte qu'on fait glisser
  const tilt = (x) => Math.max(-6, Math.min(6, x * 0.02))

  // Change de projet en faisant sortir la modale sur le côté (depuis sa position actuelle si on swipe)
  const go = (dir) => {
    const change = dir > 0 ? onNext : onPrev
    if (!change || busy.current) return
    if (reduced() || !slideRef.current) { change(); return }
    busy.current = true
    enterDir.current = dir
    const out = -dir * (window.innerWidth + slideRef.current.offsetWidth) / 2
    gsap.to(slideRef.current, {
      x: out,
      rotation: tilt(out),
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: change,
    })
  }

  useEffect(() => { goRef.current = go })

  // Nouveau projet : le texte repart du haut, le contenu entre du côté opposé
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    if (boxRef.current) boxRef.current.scrollTop = 0
    const el = slideRef.current
    const dir = enterDir.current
    enterDir.current = 0
    if (!el || !dir) return
    const from = dir * (window.innerWidth + el.offsetWidth) / 2
    gsap.fromTo(el,
      { x: from, rotation: tilt(from), opacity: 0 },
      { x: 0, rotation: 0, opacity: 1, duration: 0.42, ease: 'power3.out', onComplete: () => { busy.current = false } })
  }, [project.id])

  // Swipe horizontal (tactile) : le contenu suit le doigt, puis part ou revient en place
  const onTouchStart = (e) => {
    if (busy.current) return
    const p = e.touches[0]
    touchRef.current = { x: p.clientX, y: p.clientY, axis: null }
  }
  const onTouchMove = (e) => {
    const t = touchRef.current
    if (!t || reduced()) return
    const p = e.touches[0]
    const dx = p.clientX - t.x
    const dy = p.clientY - t.y
    // Le premier mouvement net décide : horizontal (changement de projet) ou vertical (défilement du texte)
    if (!t.axis && Math.hypot(dx, dy) > 8) t.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (t.axis !== 'x' || !slideRef.current) return
    // Sans projet voisin de ce côté, résistance
    const can = dx < 0 ? onNext : onPrev
    const x = can ? dx : dx * 0.25
    gsap.set(slideRef.current, { x, rotation: tilt(x), opacity: 1 - Math.min(Math.abs(x) / slideRef.current.offsetWidth, 1) * 0.4 })
  }
  const onTouchEnd = (e) => {
    const t = touchRef.current
    touchRef.current = null
    if (!t) return
    const p = e.changedTouches[0]
    const dx = p.clientX - t.x
    const dy = p.clientY - t.y
    const swipe = Math.abs(dx) >= 60 && Math.abs(dx) >= Math.abs(dy) * 1.5
    const dir = dx < 0 ? 1 : -1
    if (swipe && (dir > 0 ? onNext : onPrev)) { go(dir); return }
    // Geste trop court : retour en place
    if (slideRef.current) gsap.to(slideRef.current, { x: 0, rotation: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' })
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
      if (e.key === 'ArrowRight' && onNext) { goRef.current(1); return }
      if (e.key === 'ArrowLeft' && onPrev) { goRef.current(-1); return }
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
      <div className={styles.swipe} ref={slideRef}>
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
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button className={styles.close} onClick={onClose} aria-label={closeLabel}>✕</button>

          {/* Navigation entre projets (aussi au swipe et aux flèches du clavier) */}
          {onPrev && onNext && (
            <div className={styles.pager}>
              <button type="button" className={styles.pagerBtn} onClick={() => go(-1)} aria-label={prevLabel}>‹</button>
              <span className={styles.pagerCount} aria-live="polite">{position[0]} / {position[1]}</span>
              <button type="button" className={styles.pagerBtn} onClick={() => go(1)} aria-label={nextLabel}>›</button>
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
      </div>
    </div>,
    document.body
  )
}

export default ProjectModal
