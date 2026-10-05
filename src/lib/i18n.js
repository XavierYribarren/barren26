export const locales = ['fr', 'en']
export const defaultLocale = 'fr'

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
        needs: 'Your need',
        siteWeb: 'Website',
        webApp: 'Web app',
        cta: "Let's talk",
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    trust: {
      label: 'They trust me',
    },
    hero: {
      label: 'FREELANCE / WEB DEVELOPMENT',
      headline: 'Every project deserves the real thing.',
      subline: 'I design and build digital products that are clear, fast, and built to last.',
      cta: 'Scroll to explore ↓',
      reelCaption: 'A few projects, in motion.',
    },
    services: {
      sectionLabel: 'What I do',
      items: [
        {
          number: '01',
          title: 'Interface Design',
          description:
            'From wireframe to pixel-perfect UI. Clean, functional design that works for everyone, from a local shop owner to a Series A startup.',
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
      modal: { role: 'Role', stack: 'Stack', visit: 'Visit site →', highlights: 'Designed for the salon' },
      filter: { label: 'Filter projects by type', all: 'All' },
    },
    about: {
      sectionLabel: 'About',
      heading: 'Craft, clarity,\nand digital performance.',
      portfolio: 'My portfolio →',
      paragraphs: [
        "I'm a freelance developer based in France. I work with startups, local businesses, artists, and brands, whoever has a project worth building.",
        'No account manager in the middle. You work directly with me, from the first call to the final delivery.',
        "I care about the details most people skip: performance, accessibility, the way a button feels on mobile. That's what makes the difference between a site people use and one they leave.",
      ],
    },
    contact: {
      headline: "Let's work\ntogether.",
      subline: "Tell me about your project. I'll get back to you shortly.",
      footer: '© 2026 Barren · Design & Development',
    },
    need: {
      heading: 'You need:',
      siteWeb: 'A website',
      webApp: 'A web app',
    },
    meta: {
      title: 'Barren · Freelance Web Developer',
      description: 'I design and build digital products that are clear, fast, and built to last.',
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
        needs: 'Votre besoin',
        siteWeb: 'Site web',
        webApp: 'Web app',
        cta: 'Discutons',
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    trust: {
      label: 'Ils me font confiance',
    },
    hero: {
      label: 'FREELANCE / WEB DÉVELOPPEMENT',
      headline: "Chaque projet mérite d'être bien fait.",
      subline: 'Je conçois et développe des produits digitaux clairs, rapides et faits pour durer.',
      cta: 'Défiler pour explorer ↓',
      reelCaption: 'Quelques projets, en mouvement.',
    },
    services: {
      sectionLabel: 'Ce que je fais',
      items: [
        {
          number: '01',
          title: "Design d'interface",
          description:
            "Du wireframe au pixel parfait. Un design propre et fonctionnel, accessible à tous, d'une boutique locale à une startup en pleine croissance.",
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
      modal: { role: 'Rôle', stack: 'Stack', visit: 'Voir le site →', highlights: 'Pensé pour le salon' },
      filter: { label: 'Filtrer les projets par type', all: 'Tous' },
    },
    about: {
      sectionLabel: 'À propos',
      heading: 'Craft, clarté,\net performance digitale.',
      portfolio: 'Mon portfolio →',
      paragraphs: [
        "Je suis développeur freelance basé en France. Je travaille avec des startups, des commerces locaux, des artistes et des marques, quiconque a un projet qui mérite d'être bien fait.",
        "Pas d'intermédiaire. Vous travaillez directement avec moi, du premier appel à la livraison finale.",
        "Je soigne les détails que la plupart ignorent : performance, accessibilité, le ressenti d'un bouton sur mobile. C'est ce qui fait la différence entre un site qu'on utilise et un site qu'on quitte.",
      ],
    },
    contact: {
      headline: 'Travaillons ensemble.',
      subline: 'Parlez-moi de votre projet. Je réponds rapidement.',
      footer: '© 2026 Barren · Design & Développement',
    },
    need: {
      heading: 'Votre besoin :',
      siteWeb: 'Site Web',
      webApp: 'Web App',
    },
    meta: {
      title: 'Barren · Développeur Web Freelance',
      description: 'Je conçois et développe des produits digitaux clairs, rapides et faits pour durer.',
    },
  },
}

export function getTranslations(locale) {
  return translations[locale] ?? translations[defaultLocale]
}
