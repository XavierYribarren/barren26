import { useState, useEffect } from 'react'
import { useTranslation } from '../../i18n'
import styles from './Sidebar.module.css'

function Sidebar() {
  const { t, lang, setLang } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('home')

  const navLinks = [
    { label: t('sidebar.nav.home'),     href: '#home' },
    { label: t('sidebar.nav.services'), href: '#services' },
    { label: t('sidebar.nav.projects'), href: '#projects' },
    { label: t('sidebar.nav.about'),    href: '#about' },
    { label: t('sidebar.nav.contact'),  href: '#contact' },
  ]

  useEffect(() => {
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
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <aside className={styles.sidebar} data-sidebar>
        <div className={styles.top}>
          <div className={styles.logo}>BARREN</div>
          <p key={lang} className={`${styles.tagline} langSwap`}>{t('sidebar.tagline')}</p>
        </div>

        <nav className={styles.nav}>
          {navLinks.map(({ label, href }) => {
            const id = href.slice(1)
            return (
              <a
                key={href}
                href={href}
                className={`${styles.navLink} ${activeId === id ? styles.active : ''}`}
                onClick={(e) => handleNavClick(e, href)}
              >
                <span key={lang} className="langSwap">{label}</span>
              </a>
            )
          })}
        </nav>

        <div className={styles.langSwitcher}>
          {['en', 'fr'].map((l) => (
            <button
              key={l}
              className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
              onClick={() => setLang(l)}
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
        <span className={styles.mobileLogo}>BARREN</span>
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
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={styles.mobileNavLink}
              onClick={(e) => handleNavClick(e, href)}
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
