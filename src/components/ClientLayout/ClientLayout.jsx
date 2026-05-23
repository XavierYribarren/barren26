'use client'
import dynamic from 'next/dynamic'
import Sidebar from '../Sidebar/Sidebar'
import ScrollProgress from '../ScrollProgress/ScrollProgress'
import AppInit from '../AppInit/AppInit'
import DevColorTweaker from '../DevColorTweaker/DevColorTweaker'
import styles from '../../App.module.css'

const Background = dynamic(() => import('../Background/Background'), { ssr: false })

const isDev = process.env.NODE_ENV !== 'production'

export default function ClientLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Background />
      <ScrollProgress />
      <Sidebar />
      <AppInit />
      <main className={styles.main}>
        {children}
      </main>
      {isDev && <DevColorTweaker isDev={isDev} />}
    </div>
  )
}
