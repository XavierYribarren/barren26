// Usage unique : crée le projet « Teddybeard » (publié) sans toucher aux autres documents.
// Essai à blanc (aucune écriture, aucun upload) :
//   DRY_RUN=1 npx sanity exec scripts/add-project-teddybeard.js --with-user-token
// Écriture :
//   npx sanity exec scripts/add-project-teddybeard.js --with-user-token
import {createReadStream, existsSync, readdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {LexoRank} from 'lexorank'
import {tagOptions} from '../schemaTypes/tagOptions.js'

const client = getCliClient({apiVersion: '2025-10-01'})
const DRY_RUN = process.env.DRY_RUN === '1'

const ID = 'project-teddybeard'
const DESKTOP = '/home/barren/Images/Captures d’écran/teddybeard_desktop.png'
const MOBILE = '/home/barren/Images/Captures d’écran/teddybeard_mobile.png'

const fail = (msg) => {
  console.error(`✖ ${msg}`)
  process.exit(1)
}

// 1. Les deux images doivent exister avant tout upload
const missing = [DESKTOP, MOBILE].filter((p) => !existsSync(p))
if (missing.length) {
  console.error('✖ Image(s) introuvable(s) :')
  for (const p of missing) console.error(`  ${p}`)
  console.error(`Contenu de ${dirname(DESKTOP)} :`)
  for (const name of readdirSync(dirname(DESKTOP))) console.error(`  ${name}`)
  process.exit(1)
}

// 2. Ne jamais écraser un document existant (publié ou brouillon), ni réutiliser le slug
const existing = await client.fetch(
  '*[_id in $ids || (_type == "project" && slug.current == "teddybeard")]._id',
  {ids: [ID, `drafts.${ID}`]},
)
if (existing.length) fail(`Document déjà présent : ${existing.join(', ')}. Rien n'est modifié.`)

const tags = ['vitrine']
const allowed = new Set(tagOptions.map((t) => t.value))
if (tags.some((t) => !allowed.has(t))) fail('Tag absent de tagOptions')

// 3. Rang avant le premier projet, même méthode que pour Vernet
const projects = await client.fetch(
  '*[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank asc){_id, order, orderRank}',
)
let orderRank
let position = 'premier'
const firstRank = projects[0]?.orderRank ? LexoRank.parse(projects[0].orderRank) : null
const before = firstRank ? LexoRank.min().between(firstRank) : null
if (before && before.compareTo(firstRank) < 0 && before.compareTo(LexoRank.min()) > 0) {
  orderRank = before.toString()
} else {
  // Repli : après le dernier rang
  const last = projects.at(-1)?.orderRank
  orderRank = (last ? LexoRank.parse(last) : LexoRank.min()).genNext().genNext().toString()
  position = 'dernier'
}
if (projects.some((p) => p.orderRank === orderRank)) fail(`Rang ${orderRank} déjà utilisé`)
const orders = projects.map((p) => p.order).filter((n) => typeof n === 'number')
const order = position === 'premier' ? Math.min(...orders) - 1 : Math.max(...orders) + 1

const ls = (fr, en) => ({_type: 'localizedString', fr, en})
const lt = (fr, en) => ({_type: 'localizedText', fr, en})
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const highlight = (title, benefit) => ({_key: key(), _type: 'highlight', title, benefit})

const ALT_DESKTOP =
  'Page d\'accueil du site Teddybeard : le nom en lettres dorées derrière un fauteuil de barbier rouge'
const ALT_MOBILE = 'Version mobile de la page d\'accueil du site Teddybeard'

const content = {
  _id: ID,
  _type: 'project',
  name: ls('Teddybeard', 'Teddybeard'),
  slug: {_type: 'slug', current: 'teddybeard'},
  category: ls('Site vitrine', 'Showcase site'),
  description: lt(
    "Démo de site vitrine pour un barbier fictif, construite autour d'une page d'accueil en photo plein écran.",
    'Demo showcase website for a fictional barber shop, built around a full-screen photo home page.',
  ),
  role: ls('Conception, design et développement', 'Concept, design and development'),
  highlights: [
    highlight(
      ls("Une page d'accueil en photo plein écran", 'A full-screen photo home page'),
      ls(
        "Le décor du salon est visible dès l'arrivée sur le site.",
        "Visitors see the shop's interior as soon as they land.",
      ),
    ),
    highlight(
      ls('Le nom en très grand, en partie caché par le fauteuil', 'The name set very large, partly hidden by the chair'),
      ls('La marque et le lieu se lisent en un seul visuel.', 'Brand and place read as a single image.'),
    ),
    highlight(
      ls('Les trois prestations affichées en tête', 'The three services shown up front'),
      ls(
        'Coupe, barbe, visagisme : on sait tout de suite ce que propose le salon.',
        'Cut, beard, face styling: visitors know straight away what the shop offers.',
      ),
    ),
    highlight(
      ls("Un bouton de réservation placé selon l'écran", 'A booking button placed for each screen'),
      ls(
        '« Prendre rendez-vous » en haut à droite sur ordinateur, en bas sur mobile.',
        '“Prendre rendez-vous” top right on desktop, at the bottom on mobile.',
      ),
    ),
  ],
  tags,
  stack: ['React', 'TypeScript'],
  url: 'https://teddybeard.netlify.app/',
  // Estimations d'après les captures (pixels relevés) : à ajuster dans le Studio
  theme: {
    bg: '#160d03',
    text: '#f1e6c8',
    accent: '#dab363',
    stage: '#dfc893',
    fontDisplay: 'Playfair Display',
  },
  order,
  orderRank,
  publishedAt: new Date().toISOString(),
}

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' && val !== 'highlight' ? undefined : val), 2)

if (DRY_RUN) {
  console.log(`Placé en ${position} : orderRank ${orderRank} (premier actuel : ${projects[0]?._id} ${projects[0]?.orderRank}), order ${order}`)
  console.log(`\nImages (non uploadées en essai à blanc) :`)
  console.log(`  desktop → teddybeard-desktop.png, alt « ${ALT_DESKTOP} »`)
  console.log(`  mobile  → teddybeard-mobile.png, alt « ${ALT_MOBILE} »`)
  console.log(`\navant : (aucun document ${ID})`)
  console.log(`après : ${clean(content)}`)
  console.log('\nEssai à blanc : rien n\'est écrit, aucune image n\'est uploadée.')
  process.exit(0)
}

// 4. Upload des images (noms de fichiers ASCII côté Sanity)
const upload = (path, filename) => client.assets.upload('image', createReadStream(path), {filename})
const [desk, mob] = await Promise.all([
  upload(DESKTOP, 'teddybeard-desktop.png'),
  upload(MOBILE, 'teddybeard-mobile.png'),
])

const doc = {
  ...content,
  coverDesktop: {_type: 'image', asset: {_type: 'reference', _ref: desk._id}, alt: ALT_DESKTOP},
  coverMobile: {_type: 'image', asset: {_type: 'reference', _ref: mob._id}, alt: ALT_MOBILE},
}

// createIfNotExists : filet de sécurité si le document est apparu entre-temps
await client.transaction().createIfNotExists(doc).commit()
const created = await client.fetch('*[_id == $id][0]{orderRank}', {id: ID})
if (created?.orderRank !== orderRank) fail('Un document existant a été trouvé à la création, il n\'a pas été modifié.')

console.log(`✔ ${ID} créé, placé en ${position} (orderRank ${orderRank}, order ${order})`)
console.log(`  images : ${desk._id}, ${mob._id}`)
