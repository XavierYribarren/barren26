'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '../../i18n'
import { scrollToTarget } from '../../lib/smoothScroll'
import { subscribeHeroProgress } from '../../lib/heroProgress'
import styles from './Sidebar.module.css'

function Sidebar() {
  const { t, lang } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const subPath = pathname.split('/').slice(2).join('/')
  const isMainPage = subPath === ''

  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('home')
  const [needsOpen, setNeedsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [heroP, setHeroP] = useState(null)

  const anchorsBefore = [
    { id: 'home',     label: t('sidebar.nav.home') },
    { id: 'services', label: t('sidebar.nav.services') },
    { id: 'projects', label: t('sidebar.nav.projects') },
  ]

  const anchorsAfter = [
    { id: 'about',   label: t('sidebar.nav.about') },
    { id: 'contact', label: t('sidebar.nav.contact') },
  ]

  // Barre desktop : liens d'ancres seuls, le reste vit dans le menu mobile et la page
  const desktopAnchors = [
    { id: 'services', label: t('sidebar.nav.services') },
    { id: 'projects', label: t('sidebar.nav.projects') },
    { id: 'about',    label: t('sidebar.nav.about') },
    { id: 'contact',  label: t('sidebar.nav.contact') },
  ]

  const needsLinks = [
    { label: t('sidebar.nav.siteWeb'), path: 'site-web' },
    { label: t('sidebar.nav.webApp'),  path: 'web-app' },
  ]

  const isNeedsActive = subPath === 'site-web' || subPath === 'web-app'

  useEffect(() => {
    if (!isMainPage) return
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { threshold: 0.3 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [isMainPage])

  // Progression de la scène du hero (accueil) : pilote les couleurs de la barre
  useEffect(() => subscribeHeroProgress(setHeroP), [])

  // Barre desktop : fond noir dès qu'on quitte le haut de page (hors scène du hero)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Accueil : noir sur le papier (avant que la scène ne publie, on suppose le haut de page),
  // clair pendant la scène, fond noir une fois la scène passée. Ailleurs : fond noir après 10px.
  const onPaper = isMainPage && (heroP === null ? !scrolled : heroP <= 0.12)
  const overStage = isMainPage && heroP !== null && heroP > 0.12 && heroP < 1
  const solid = isMainPage && heroP !== null ? heroP >= 1 : scrolled
  const barClass = [styles.topBar, onPaper && styles.onPaper, overStage && styles.overStage, solid && styles.scrolled]
    .filter(Boolean).join(' ')

  function handleLogoClick() {
    setMenuOpen(false)
    if (isMainPage) {
      scrollToTarget(0)
    } else {
      router.push(`/${locale}`)
    }
  }

  function handleAnchorClick(e, id) {
    e.preventDefault()
    setMenuOpen(false)
    if (isMainPage) {
      scrollToTarget(`#${id}`)
    } else {
      router.push(`/${locale}#${id}`)
    }
  }

  function switchLang(l) {
    router.push(subPath ? `/${l}/${subPath}` : `/${l}`)
  }

  return (
    <>
      <header className={barClass} data-nav>
        <button type="button" className={styles.logo} onClick={handleLogoClick}>BARREN</button>

        <nav className={styles.nav} aria-label={lang === 'en' ? 'Main navigation' : 'Navigation principale'}>
          {desktopAnchors.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`${styles.navLink} ${!isNeedsActive && activeId === id ? styles.active : ''}`}
              onClick={(e) => handleAnchorClick(e, id)}
              aria-current={!isNeedsActive && activeId === id ? 'true' : undefined}
            >
              <span key={lang} className="langSwap">{label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.barLang}>
          {['fr', 'en'].map((l) => (
            <button
              key={l}
              className={`${styles.barLangBtn} ${locale === l ? styles.barLangActive : ''}`}
              onClick={() => switchLang(l)}
              aria-label={l === 'en' ? 'Switch to English' : 'Passer en français'}
              aria-pressed={locale === l}
            >
              {t(`sidebar.langSwitcher.${l}`)}
            </button>
          ))}
        </div>

        <a href="#contact" className={styles.cta} onClick={(e) => handleAnchorClick(e, 'contact')}>
          <span key={lang} className="langSwap">{t('sidebar.nav.cta')}</span>
        </a>
      </header>

      {/* Mobile top bar */}
      <header className={styles.mobileBar}>
        <button type="button" className={styles.mobileLogo} onClick={handleLogoClick}>BARREN</button>
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {anchorsBefore.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.mobileNavLink}
              onClick={(e) => handleAnchorClick(e, id)}
            >
              {label}
            </a>
          ))}

          <div className={styles.mobileNeedsGroup}>
            <button
              type="button"
              className={styles.mobileNavBtn}
              onClick={() => setNeedsOpen(o => !o)}
              aria-expanded={needsOpen}
              aria-controls="mobile-needs-submenu"
            >
              {t('sidebar.nav.needs')}
              <span className={`${styles.mobileNavArrow} ${needsOpen ? styles.mobileNavArrowOpen : ''}`} aria-hidden="true">›</span>
            </button>
                <div
                id="mobile-needs-submenu"
                className={`${styles.mobileNeedsSub} ${needsOpen ? styles.mobileNeedsSubOpen : ''}`}
              >
                {needsLinks.map(({ label, path }) => (
                  <Link
                    key={path}
                    href={`/${locale}/${path}`}
                    className={styles.mobileNavSubLink}
                    onClick={() => setMenuOpen(false)}
                    aria-current={subPath === path ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </div>
          </div>

          {anchorsAfter.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.mobileNavLink}
              onClick={(e) => handleAnchorClick(e, id)}
            >
              {label}
            </a>
          ))}

          <div className={styles.mobileLangSwitcher}>
            {['en', 'fr'].map((l) => (
              <button
                key={l}
                className={`${styles.langBtn} ${locale === l ? styles.langActive : ''}`}
                onClick={() => { switchLang(l); setMenuOpen(false) }}
                aria-label={l === 'en' ? 'Switch to English' : 'Passer en français'}
                aria-pressed={locale === l}
              >
                {t(`sidebar.langSwitcher.${l}`)}
              </button>
            ))}
          </div>

          <a href="mailto:xavier.yribarren@gmail.com" className={styles.mobileEmail}>
            xavier.yribarren@gmail.com
          </a>
        </div>
      )}
    </>
  )
}

export default Sidebar
