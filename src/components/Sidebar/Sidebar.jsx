'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from '../../i18n'
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

  const anchorsBefore = [
    { id: 'home',     label: t('sidebar.nav.home') },
    { id: 'services', label: t('sidebar.nav.services') },
    { id: 'projects', label: t('sidebar.nav.projects') },
  ]

  const anchorsAfter = [
    { id: 'about',   label: t('sidebar.nav.about') },
    { id: 'contact', label: t('sidebar.nav.contact') },
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

  function handleLogoClick() {
    setMenuOpen(false)
    if (isMainPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(`/${locale}`)
    }
  }

  function handleAnchorClick(e, id) {
    e.preventDefault()
    setMenuOpen(false)
    if (isMainPage) {
      document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/${locale}#${id}`)
    }
  }

  function handleNeedsClick(path) {
    setMenuOpen(false)
    router.push(`/${locale}/${path}`)
  }

  function switchLang(l) {
    router.push(subPath ? `/${l}/${subPath}` : `/${l}`)
  }

  return (
    <>
      <aside className={styles.sidebar} data-sidebar>
        <div className={styles.top}>
          <button type="button" className={styles.logo} onClick={handleLogoClick}>BARREN</button>
          <p key={lang} className={`${styles.tagline} langSwap`}>{t('sidebar.tagline')}</p>
        </div>

        <nav className={styles.nav} aria-label={lang === 'en' ? 'Main navigation' : 'Navigation principale'}>
          {anchorsBefore.map(({ id, label }) => (
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

          {/* ── Votre besoin ── */}
          <div className={styles.navGroup}>
            <button
              type="button"
              className={`${styles.navLink} ${styles.navGroupBtn} ${isNeedsActive ? styles.active : ''}`}
              onClick={() => setNeedsOpen(o => !o)}
              aria-expanded={needsOpen}
              aria-controls="needs-submenu"
            >
              <span key={lang} className="langSwap">{t('sidebar.nav.needs')}</span>
              <span className={`${styles.navArrow} ${needsOpen ? styles.navArrowOpen : ''}`} aria-hidden="true">›</span>
            </button>
            {needsOpen && (
              <div id="needs-submenu" className={styles.navSub}>
                {needsLinks.map(({ label, path }) => (
                  <a
                    key={path}
                    href={`/${locale}/${path}`}
                    className={`${styles.navSubLink} ${subPath === path ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleNeedsClick(path) }}
                    aria-current={subPath === path ? 'page' : undefined}
                  >
                    <span key={lang} className="langSwap">{label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {anchorsAfter.map(({ id, label }) => (
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

        <div className={styles.langSwitcher}>
          {['en', 'fr'].map((l) => (
            <button
              key={l}
              className={`${styles.langBtn} ${locale === l ? styles.langActive : ''}`}
              onClick={() => switchLang(l)}
              aria-label={l === 'en' ? 'Switch to English' : 'Passer en français'}
              aria-pressed={locale === l}
            >
              {t(`sidebar.langSwitcher.${l}`)}
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <a href="mailto:xavier.yribarren@gmail.com" className={styles.email}>
            xavier.yribarren@gmail.com
          </a>
        </div>
      </aside>

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
              {t('sidebar.nav.needs')} <span aria-hidden="true">{needsOpen ? '↑' : '↓'}</span>
            </button>
            {needsOpen && (
              <div id="mobile-needs-submenu" className={styles.mobileNeedsSub}>
                {needsLinks.map(({ label, path }) => (
                  <a
                    key={path}
                    href={`/${locale}/${path}`}
                    className={styles.mobileNavSubLink}
                    onClick={(e) => { e.preventDefault(); handleNeedsClick(path) }}
                    aria-current={subPath === path ? 'page' : undefined}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
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

          <a href="mailto:xavier.yribarren@gmail.com" className={styles.mobileEmail}>
            xavier.yribarren@gmail.com
          </a>
        </div>
      )}
    </>
  )
}

export default Sidebar
