'use client'
import { useState } from 'react'
import { useTranslation } from '../../i18n'
import { contactFormTranslations } from '../../lib/contactForm'
import styles from './ContactForm.module.css'

export default function ContactForm() {
  const { lang } = useTranslation()
  const d = contactFormTranslations[lang] ?? contactFormTranslations.fr

  const [step, setStep] = useState(1)
  const [activityId, setActivityId] = useState(null)
  const [needs, setNeeds] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const selectedActivity = d.activities.find(a => a.id === activityId)
  const nextLabel = lang === 'en' ? 'Continue →' : 'Continuer →'
  const dontKnowLabel = lang === 'en' ? "I don't know yet" : "Je ne sais pas encore"

  function selectActivity(id) {
    setActivityId(id)
    setNeeds([])
    setTimeout(() => setStep(2), 180)
  }

  function toggleNeed(need) {
    setNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity?.label,
          needs,
          name,
          email,
          phone,
        }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError(lang === 'en'
        ? 'Something went wrong. Please try again or contact me directly by email.'
        : "Une erreur est survenue. Réessayez ou contactez-moi directement par email."
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <p>{d.success}</p>
      </div>
    )
  }

  const stepLabel = step === 1
    ? d.stepActivity.question
    : step === 2
      ? d.stepNeeds.question
      : d.stepContact.emailLabel

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{d.title}</h2>
      <p className={styles.intro}>{d.intro}</p>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{stepLabel}</p>

      <div className={styles.progress} aria-hidden="true">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`${styles.progressSegment} ${step >= n ? styles.progressDone : ''}`}
          />
        ))}
      </div>

      {/* ── Étape 1 : activité ── */}
      {step === 1 && (
        <div className={styles.step}>
          <p className={styles.question}>{d.stepActivity.question}</p>
          <div className={styles.activityGrid}>
            {d.activities.map(a => (
              <button
                key={a.id}
                type="button"
                className={`${styles.activityCard} ${activityId === a.id ? styles.activitySelected : ''}`}
                onClick={() => selectActivity(a.id)}
                aria-pressed={activityId === a.id}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Étape 2 : besoins ── */}
      {step === 2 && selectedActivity && (
        <div className={styles.step}>
          <p className={styles.question}>{d.stepNeeds.question}</p>
          <p className={styles.hint}>{d.stepNeeds.hint}</p>
          <ul className={styles.needsList}>
            {[...selectedActivity.needs, dontKnowLabel].map(need => {
              const checked = needs.includes(need)
              return (
                <li key={need} className={styles.needItem}>
                  <label className={styles.needLabel}>
                    <input
                      type="checkbox"
                      className={styles.needInput}
                      checked={checked}
                      onChange={() => toggleNeed(need)}
                    />
                    <span className={styles.needBox} aria-hidden="true" />
                    <span className={styles.needText}>{need}</span>
                  </label>
                </li>
              )
            })}
          </ul>
          <button type="button" className={styles.nextBtn} onClick={() => setStep(3)}>
            {nextLabel}
          </button>
        </div>
      )}

      {/* ── Étape 3 : contact ── */}
      {step === 3 && (
        <form className={styles.step} onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="cf-name">
                {d.stepContact.nameLabel}
              </label>
              <input
                id="cf-name"
                type="text"
                required
                aria-required="true"
                className={styles.fieldInput}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={d.stepContact.namePlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="cf-email">
                {d.stepContact.emailLabel}
              </label>
              <input
                id="cf-email"
                type="email"
                required
                aria-required="true"
                aria-invalid={!!error || undefined}
                aria-describedby={error ? 'cf-error' : undefined}
                className={styles.fieldInput}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={d.stepContact.emailPlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="cf-phone">
                {d.stepContact.phoneLabel}
              </label>
              <input
                id="cf-phone"
                type="tel"
                className={styles.fieldInput}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={d.stepContact.phonePlaceholder}
              />
            </div>
          </div>
          {error && <p id="cf-error" role="alert" className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '…' : d.stepContact.submit}
          </button>
        </form>
      )}
    </div>
  )
}
