'use client'
import Sidebar from '../Sidebar/Sidebar'
import ScrollProgress from '../ScrollProgress/ScrollProgress'
import SmoothScroll from '../SmoothScroll/SmoothScroll'
import Loader from '../Loader/Loader'
import DevColorTweaker from '../DevColorTweaker/DevColorTweaker'
import styles from '../../App.module.css'

const isDev = process.env.NODE_ENV !== 'production'

export default function ClientLayout({ children }) {
  return (
    <div className={styles.layout}>
      <SmoothScroll />
      <ScrollProgress />
      <Sidebar />
      <Loader />
      <main className={styles.main}>
        {children}
      </main>
      {isDev && <DevColorTweaker isDev={isDev} />}
    </div>
  )
}
