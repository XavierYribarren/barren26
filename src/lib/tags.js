// Libellés des tags côté site.
// Garder synchronisé avec studio/schemaTypes/tagOptions.js : mêmes clés (value), même ordre.
export const tagLabels = {
  vitrine:      { fr: 'Site vitrine', en: 'Showcase site' },
  'e-commerce': { fr: 'E-commerce',   en: 'E-commerce' },
  cms:          { fr: 'CMS',          en: 'CMS' },
  'web-app':    { fr: 'Web app',      en: 'Web app' },
  '3d':         { fr: '3D',           en: '3D' },
  audio:        { fr: 'Audio',        en: 'Audio' },
  animation:    { fr: 'Animation',    en: 'Animation' },
}

const tagOrder = Object.keys(tagLabels)

// Tag inconnu : on affiche sa valeur brute plutôt que de planter
export function tagLabel(value, lang) {
  return tagLabels[value]?.[lang] ?? tagLabels[value]?.fr ?? value
}

// Tags utilisés par au moins un projet, dans l'ordre de tagOptions (inconnus à la fin)
export function usedTags(projects) {
  const used = new Set(projects.flatMap(p => p.tags ?? []))
  const known = tagOrder.filter(t => used.has(t))
  const unknown = [...used].filter(t => !tagLabels[t]).sort()
  return [...known, ...unknown]
}
