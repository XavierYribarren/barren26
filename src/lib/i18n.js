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
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    trust: {
      label: 'They trust me',
    },
    hero: {
      label: 'FREELANCE — WEB DEVELOPMENT',
      headline: 'Every project\ndeserves the real thing.',
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
      modal: { role: 'Role', stack: 'Stack', visit: 'Visit site →' },
      items: [
        { name: 'Restaurant',      category: 'Web Development', description: 'A pilot website for a pizzeria with a CMS to update the menu quickly and easily.',                                                                                                 role: 'Designer & Developer' },
        { name: '3D Configurator', category: 'Development',     description: 'A photorealistic 3D guitar configurator letting users build their dream guitar from scratch.',                                                                                     role: 'Developer' },
        { name: 'Shop',            category: 'Web Design',      description: 'A classic e-shop with personality, built simple and intuitive on Shopify.',                                                                                                        role: 'Designer & Developer' },
        { name: 'Psychologist',    category: 'Web Design',      description: 'A multi-page site for a psychologist — her practice, vision, and approach, designed to reassure patients alongside contact and appointment booking.',                               role: 'Designer & Developer' },
        { name: 'Amp Simulator',   category: 'Development',     description: "Web-based guitar amp simulations so you can hear exactly what you're buying before you buy it.",                                                                                   role: 'Developer' },
        { name: 'Music Room',      category: 'Development',     description: 'An interactive 3D music room where you can move around, reposition instruments, and assign tracks directly from your computer.',                                                   role: 'Developer' },
      ],
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
      subline: "Tell me about your project. I'll get back to you within 24h.",
      footer: '© 2026 Barren — Design & Development',
    },
    need: {
      heading: 'You need:',
      siteWeb: 'A website',
      webApp: 'A web app',
    },
    meta: {
      title: 'Barren — Freelance Web Developer',
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
      },
      langSwitcher: { en: 'EN', fr: 'FR' },
    },
    trust: {
      label: 'Ils me font confiance',
    },
    hero: {
      label: 'FREELANCE — WEB DÉVELOPPEMENT',
      headline: "Chaque projet\nmérite d'être bien fait.",
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
      modal: { role: 'Rôle', stack: 'Stack', visit: 'Voir le site →' },
      items: [
        { name: 'Restaurant',           category: 'Développement Web', description: 'Un site pilote pour pizzeria avec un CMS pour changer la carte facilement et rapidement.',                                                                                                                                                                    role: 'Designer & Développeur' },
        { name: 'Configurateur 3D',     category: 'Développement',     description: "Configurateur de guitare en 3D photoréaliste pour que l'utilisateur se crée la guitare qu'il veut.",                                                                                                                                                          role: 'Développeur' },
        { name: 'Boutique',             category: 'Design Web',        description: "E Shop classique mais avec une personnalité, et simple d'utilisation pour Shopify.",                                                                                                                                                                           role: 'Designer & Développeur' },
        { name: 'Psychologue',          category: 'Design Web',        description: "Site multi page pour une psychologue, dans lequel elle y explique sa pratique, sa vision et rassure les patients en plus de la prise de contact et RDV.",                                                                                                     role: 'Designer & Développeur' },
        { name: "Simulation d'ampli",   category: 'Développement',     description: "Implémentation de simulations d'amplis de guitare dans le web pour pouvoir tester avant d'acheter.",                                                                                                                                                          role: 'Développeur' },
        { name: 'Music Room',           category: 'Développement',     description: "Salle de musique interactive en 3D, dans laquelle il est possible de se déplacer, de déplacer les instruments et d'ajouter et assigner des pistes depuis l'ordinateur de l'utilisateur.",                                                                    role: 'Développeur' },
      ],
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
      subline: 'Parlez-moi de votre projet. Je réponds sous 24h.',
      footer: '© 2026 Barren — Design & Développement',
    },
    need: {
      heading: 'Votre besoin :',
      siteWeb: 'Site Web',
      webApp: 'Web App',
    },
    meta: {
      title: 'Barren — Développeur Web Freelance',
      description: 'Je conçois et développe des produits digitaux clairs, rapides et faits pour durer.',
    },
  },
}

export function getTranslations(locale) {
  return translations[locale] ?? translations[defaultLocale]
}
