'use client'
import { useEffect, useRef } from 'react'
import styles from './ScrollProgress.module.css'

function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current && docHeight > 0) {
        barRef.current.style.width = `${(scrollTop / docHeight) * 100}%`
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <div className={styles.bar} ref={barRef} />
}

export default ScrollProgress
