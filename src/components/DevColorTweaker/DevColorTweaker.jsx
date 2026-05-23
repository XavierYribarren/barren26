'use client'
import { useState } from 'react'
import styles from './DevColorTweaker.module.css'

const COLOR_VARS = [
  { name: '--color-bg', label: '--color-bg', default: '#0d0d0d' },
  { name: '--color-surface', label: '--color-surface', default: '#161616' },
  { name: '--color-text-primary', label: '--color-text-primary', default: '#f0ece4' },
  { name: '--color-text-secondary', label: '--color-text-secondary', default: '#888880' },
  { name: '--color-accent', label: '--color-accent', default: '#c8b89a' },
  { name: '--color-border', label: '--color-border', default: '#2a2a2a' },
]

function DevColorTweaker({ isDev }) {
  const [open, setOpen] = useState(false)

  if (!isDev) return null

  const handleChange = (varName, value) => {
    document.documentElement.style.setProperty(varName, value)
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle color tweaker"
      >
        🎨
      </button>
      {open && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Color Tokens</p>
          {COLOR_VARS.map(({ name, label, default: def }) => (
            <label key={name} className={styles.row}>
              <span className={styles.varLabel}>{label}</span>
              <input
                type="color"
                defaultValue={def}
                className={styles.colorInput}
                onChange={(e) => handleChange(name, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default DevColorTweaker
