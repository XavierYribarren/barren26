'use client'
import Hero from '../Hero/Hero'
import TrustBanner from '../TrustBanner/TrustBanner'
import Services from '../Services/Services'
import Projects from '../Projects/Projects'
import NeedSection from '../NeedSection/NeedSection'
import About from '../About/About'
import Contact from '../Contact/Contact'

export default function MainContent({ projects }) {
  return (
    <>
      <Hero />
      <TrustBanner />
      <Services />
      <Projects projects={projects} />
      <NeedSection />
      <About />
      <Contact />
    </>
  )
}
