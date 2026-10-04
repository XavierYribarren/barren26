// Thème par projet (Sanity) appliqué localement à la modale et à la card.
// SITE_THEME reprend les variables de src/styles/global.css : garder les deux synchronisés.
export const SITE_THEME = {
  bg: '#0d0d0d',
  text: '#f0ece4',
  accent: '#c8b89a',
  fontDisplay: 'Archivo Black',
}

// Seules ces polices sont chargées (Google Fonts dans global.css)
const LOADED_FONTS = {
  'Archivo Black': "'Archivo Black', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
}

const MIN_TEXT_CONTRAST = 4.5
const MIN_UI_CONTRAST = 3

function normalizeHex(value) {
  if (typeof value !== 'string') return null
  const m = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1]
  return `#${h.toLowerCase()}`
}

const toRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Mélange a dans b (t = part de a)
function mix(a, b, t) {
  const ca = toRgb(a)
  const cb = toRgb(b)
  return '#' + ca.map((v, i) => Math.round(v * t + cb[i] * (1 - t)).toString(16).padStart(2, '0')).join('')
}

// Texte secondaire : le plus proche du fond qui reste lisible
function readableSecondary(text, bg) {
  for (let t = 0.6; t < 1; t += 0.05) {
    const c = mix(text, bg, t)
    if (contrast(c, bg) >= MIN_TEXT_CONTRAST) return c
  }
  return text
}

// Accent lisible en texte : l'accent lui-même, sinon assombri vers la couleur du texte
function readableAccent(accent, text, bg) {
  if (contrast(accent, bg) >= MIN_TEXT_CONTRAST) return accent
  for (let t = 0.1; t < 1; t += 0.05) {
    const c = mix(text, accent, t)
    if (contrast(c, bg) >= MIN_TEXT_CONTRAST) return c
  }
  return text
}

// Texte secondaire « doux » : couleur du texte à ~85 %, ou pleine si le contraste ne suit pas
function softText(text, bg) {
  const c = mix(text, bg, 0.85)
  return contrast(c, bg) >= MIN_TEXT_CONTRAST ? c : text
}

// Couleur la plus lisible sur fill parmi les candidates
function bestInk(fill, candidates) {
  return candidates.reduce((best, c) => (contrast(c, fill) > contrast(best, fill) ? c : best))
}

function resolveColors(theme) {
  let bg = normalizeHex(theme?.bg) ?? SITE_THEME.bg
  let text = normalizeHex(theme?.text) ?? SITE_THEME.text
  // Couple illisible : on garde celui du site
  if (contrast(text, bg) < MIN_TEXT_CONTRAST) {
    bg = SITE_THEME.bg
    text = SITE_THEME.text
  }
  const accent = normalizeHex(theme?.accent) ?? SITE_THEME.accent
  return { bg, text, accent }
}

// Variables CSS locales à la modale ; objet vide si le thème est celui du site
export function modalThemeVars(theme) {
  const { bg, text, accent } = resolveColors(theme)
  const vars = {}
  const colorsChanged = bg !== SITE_THEME.bg || text !== SITE_THEME.text

  if (colorsChanged) {
    vars['--color-bg'] = bg
    vars['--color-text-primary'] = text
    vars['--color-text-secondary'] = readableSecondary(text, bg)
    vars['--color-border'] = mix(text, bg, 0.18)
    vars['--color-surface'] = mix(text, bg, 0.06)
    vars['--modal-soft'] = softText(text, bg)
  }

  if (colorsChanged || accent !== SITE_THEME.accent) {
    // L'accent brut sert au décor (bordures, filets) ; en texte, une version assez contrastée
    const ink = readableAccent(accent, text, bg)
    vars['--color-accent'] = accent
    vars['--modal-accent-ink'] = ink
    vars['--modal-focus'] = contrast(accent, bg) >= MIN_UI_CONTRAST ? accent : ink
    // Bouton plein : fond accent si un texte lisible existe dessus, sinon texte/fond du thème inversés
    const btnInk = bestInk(accent, [text, bg])
    const btnOk = contrast(btnInk, accent) >= MIN_TEXT_CONTRAST
    vars['--btn-bg'] = btnOk ? accent : text
    vars['--btn-ink'] = btnOk ? btnInk : bg
  }

  // Scène des captures : theme.stage, sinon le texte du thème ; sans thème propre, fond de la modale (CSS)
  const stage = normalizeHex(theme?.stage) ?? (colorsChanged ? text : null)
  if (stage) {
    vars['--stage-bg'] = stage
    vars['--stage-ink'] = bestInk(stage, [text, bg, SITE_THEME.text, SITE_THEME.bg])
  }

  const font = theme?.fontDisplay
  if (font && font !== SITE_THEME.fontDisplay && LOADED_FONTS[font]) {
    vars['--font-display'] = LOADED_FONTS[font]
  }

  return vars
}

// Fond de la capture sur la card ; null = fond actuel de la card
export function cardBackground(theme) {
  const { bg } = resolveColors(theme)
  return bg !== SITE_THEME.bg ? bg : null
}
