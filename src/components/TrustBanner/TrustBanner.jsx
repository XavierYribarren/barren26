'use client'
import { useTranslation } from '../../i18n'
import styles from './TrustBanner.module.css'

const clients = [
  { name: 'CNRS',          logo: '/logos/Cnrs-logo.svg.png' },
  { name: 'Pave Team',     logo: '/logos/pavelogo.png' },
  { name: 'IFRC',          logo: '/logos/ifrc_logo.png' },
  { name: 'Coralie Colin', logo: '/logos/coraliecolin.webp' },
    { name: 'INSA', logo: '/logos/insalogo.png' },
]

function TrustBanner() {
  const { t } = useTranslation()

  return (
    <div className={styles.banner}>
      <span className={styles.label}>{t('trust.label')}</span>
      <div className={styles.track}>
        {[false, true].map((hidden) => (
          <ul key={String(hidden)} className={styles.list} aria-hidden={hidden}>
            {clients.map(({ name, logo }) => (
              <li key={name} className={styles.item}>
                <img src={logo} alt={name} className={styles.logo} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default TrustBanner
