import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'

export { LanguageProvider } from './LanguageContext'

export const translations = {
  en: {
    sidebar: {
      tagline: 'Web & App Development',
      nav: {
        home: 'Home',
        services: 'Services',
        projects: 'Projects',
        about: 'About',
        contact: 'Contact',
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    hero: {
      label: 'FREELANCE — WEB DEVELOPMENT',
      headline: 'Good work\nspeaks for itself.',
      subline: 'I design and build digital products that are clear, fast, and built to last.',
      cta: 'Scroll to explore ↓',
    },
    services: {
      sectionLabel: 'What I do',
      items: [
        {
          number: '01',
          title: 'Interface Design',
          description:
            'From wireframe to pixel-perfect UI. Clean, functional design that works for everyone — from a local shop owner to a Series A startup.',
        },
        {
          number: '02',
          title: 'Web Development',
          description:
            'React, full-stack, or whatever the project needs. I build things properly: fast, accessible, and easy to hand off.',
        },
        {
          number: '03',
          title: 'E-commerce',
          description:
            'Shopify, custom solutions, or hybrid. Products that convert without feeling like a sales machine.',
        },
        {
          number: '04',
          title: 'Brand & Identity',
          description:
            'Logo, visual system, tone of voice. The foundation everything else is built on.',
        },
      ],
    },
    projects: {
      sectionLabel: 'Selected work',
      cta: 'More work available on request →',
    },
    about: {
      sectionLabel: 'About',
      paragraphs: [
        "I'm a freelance developer based in France. I work with startups, local businesses, artists, and brands, whoever has a project worth building.",
        'No account manager in the middle. You work directly with me, from the first call to the final delivery.',
        "I care about the details most people skip: performance, accessibility, the way a button feels on mobile. That's what makes the difference between a site people use and one they leave.",
      ],
    },
    contact: {
      headline: "Let's work\ntogether.",
      subline: "Tell me about your project. I'll get back to you within 24h.",
      footer: '© 2026 Barren — Design & Development',
    },
  },

  fr: {
    sidebar: {
      tagline: 'Développement Web & App',
      nav: {
        home: 'Accueil',
        services: 'Services',
        projects: 'Projets',
        about: 'À propos',
        contact: 'Contact',
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    hero: {
      label: 'FREELANCE — WEB DÉVELOPPEMENT',
      headline: 'Le bon travail\nparle de lui-même.',
      subline: 'Je conçois et développe des produits digitaux clairs, rapides et faits pour durer.',
      cta: 'Défiler pour explorer ↓',
    },
    services: {
      sectionLabel: 'Ce que je fais',
      items: [
        {
          number: '01',
          title: "Design d'interface",
          description:
            'Du wireframe au pixel parfait. Un design propre et fonctionnel, accessible à tous, d\'une boutique locale à une startup en pleine croissance.',
        },
        {
          number: '02',
          title: 'Développement web',
          description:
            'React, full-stack, ou ce que le projet demande. Je construis les choses correctement : rapide, accessible, facile à reprendre.',
        },
        {
          number: '03',
          title: 'E-commerce',
          description:
            'Shopify, solutions sur mesure ou hybride. Des produits qui convertissent sans ressembler à une machine à vendre.',
        },
        {
          number: '04',
          title: 'Marque & Identité',
          description:
            'Logo, système visuel, ton éditorial. Les fondations sur lesquelles tout le reste repose.',
        },
      ],
    },
    projects: {
      sectionLabel: 'Projets sélectionnés',
      cta: "D'autres projets disponibles sur demande →",
    },
    about: {
      sectionLabel: 'À propos',
      paragraphs: [
        'Je suis développeur freelance basé en France. Je travaille avec des startups, des commerces locaux, des artistes et des marques, quiconque a un projet qui mérite d\'être bien fait.',
        "Pas d'intermédiaire. Vous travaillez directement avec moi, du premier appel à la livraison finale.",
        "Je soigne les détails que la plupart ignorent : performance, accessibilité, le ressenti d'un bouton sur mobile. C'est ce qui fait la différence entre un site qu'on utilise et un site qu'on quitte.",
      ],
    },
    contact: {
      headline: 'Travaillons\n ensemble.',
      subline: 'Parlez-moi de votre projet. Je réponds sous 24h.',
      footer: '© 2026 Barren — Design & Développement',
    },
  },
}

export function useTranslation() {
  const { lang, setLang } = useContext(LanguageContext)

  const t = (key) => {
    const parts = key.split('.')
    let val = translations[lang]
    for (const part of parts) {
      if (val == null) return key
      val = val[part]
    }
    return val !== undefined ? val : key
  }

  return { t, lang, setLang }
}
