// Usage unique : exporte les projets codés en dur vers projects.ndjson pour `sanity dataset import`.
// node scripts/export-projects-ndjson.mjs
import {existsSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'projects.ndjson')

const {projects} = await import(pathToFileURL(join(root, 'src/lib/projects.js')))
const {translations} = await import(pathToFileURL(join(root, 'src/lib/i18n.js')))

const LOCALES = ['fr', 'en']
const TEXT_FIELDS = ['name', 'category', 'description', 'role']
const DEFAULT_THEME = {bg: '#0d0d0d', text: '#f0ece4', accent: '#c8b89a', fontDisplay: 'Archivo Black'}

// Les textes sont liés aux données par index : on refuse de continuer si les longueurs divergent.
const counts = {'src/lib/projects.js': projects.length}
for (const l of LOCALES) counts[`i18n ${l}.projects.items`] = translations[l]?.projects?.items?.length ?? 0
if (new Set(Object.values(counts)).size !== 1) {
  console.error('✖ Décalage entre les sources, export annulé :')
  for (const [src, n] of Object.entries(counts)) console.error(`  ${src}: ${n}`)
  process.exit(1)
}

const missing = []
let found = 0

function imageRef(publicPath, slug, field) {
  if (!publicPath) return undefined
  const abs = join(root, 'public', publicPath.replace(/^\//, ''))
  if (!existsSync(abs)) {
    missing.push(`${slug}.${field} → ${abs}`)
    return undefined
  }
  found++
  return {_type: 'image', _sanityAsset: `image@file://${abs}`}
}

const publishedAt = new Date().toISOString()
const warnings = []

const docs = projects.map((p, i) => {
  const localized = {}
  for (const field of TEXT_FIELDS) {
    localized[field] = Object.fromEntries(
      LOCALES.map((l) => [l, translations[l].projects.items[i][field]]),
    )
    for (const l of LOCALES) {
      if (!localized[field][l]) warnings.push(`${p.slug}.${field}.${l} vide`)
    }
  }

  const doc = {
    _id: `project-${p.slug}`,
    _type: 'project',
    name: {_type: 'localizedString', ...localized.name},
    slug: {_type: 'slug', current: p.slug},
    category: {_type: 'localizedString', ...localized.category},
    description: {_type: 'localizedText', ...localized.description},
    role: {_type: 'localizedString', ...localized.role},
    coverDesktop: imageRef(p.desk, p.slug, 'coverDesktop'),
    coverMobile: imageRef(p.mob, p.slug, 'coverMobile'),
    theme: {...DEFAULT_THEME},
    stack: p.stack,
    url: p.url ?? undefined,
    order: i + 1,
    publishedAt,
  }
  // JSON.stringify retire les clés undefined (mobile absent, url null, image manquante)
  return doc
})

writeFileSync(outFile, docs.map((d) => JSON.stringify(d)).join('\n') + '\n')

console.log('Récapitulatif')
console.log(`  Projets exportés : ${docs.length}`)
console.log(`  Images trouvées  : ${found}`)
console.log(`  Images manquantes: ${missing.length}`)
for (const m of missing) console.log(`    ✖ ${m}`)
for (const w of warnings) console.log(`  ⚠ ${w}`)
console.log(`  Fichier : ${outFile}`)
if (missing.length) process.exitCode = 1
