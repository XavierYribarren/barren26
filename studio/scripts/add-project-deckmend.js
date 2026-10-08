// Usage unique : crée le projet « Deckmend » (publié) sans toucher aux autres documents.
// Essai à blanc (aucune écriture, aucun upload) :
//   DRY_RUN=1 npx sanity exec scripts/add-project-deckmend.js --with-user-token
// Écriture :
//   npx sanity exec scripts/add-project-deckmend.js --with-user-token
import {createReadStream, existsSync, readdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {LexoRank} from 'lexorank'
import {tagOptions} from '../schemaTypes/tagOptions.js'

const client = getCliClient({apiVersion: '2025-10-01'})
const DRY_RUN = process.env.DRY_RUN === '1'

const ID = 'project-deckmend'
const DESKTOP = '/home/barren/Images/Captures d’écran/deckmend_site_desktop.png'
const MOBILE = '/home/barren/Images/Captures d’écran/deckmend_app_mobile.png'

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
  '*[_id in $ids || (_type == "project" && slug.current == "deckmend")]._id',
  {ids: [ID, `drafts.${ID}`]},
)
if (existing.length) fail(`Document déjà présent : ${existing.join(', ')}. Rien n'est modifié.`)

const tags = ['vitrine', 'web-app']
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

// Décrits d'après les captures
const ALT_DESKTOP =
  "Page d'accueil du site Deckmend : le titre « Rien ne se perd. Tout se rebat. » à côté d'un éventail de cartes à jouer, et trois boutons pour installer l'application sur Android, iPhone ou ordinateur"
const ALT_MOBILE =
  "Application Deckmend sur mobile : un paquet Bicycle rouge à 46 cartes sur 52, les cœurs dépliés avec le 5 et le 10 signalés, et un bouton Valider"

const content = {
  _id: ID,
  _type: 'project',
  name: ls('Deckmend', 'Deckmend'),
  slug: {_type: 'slug', current: 'deckmend'},
  category: ls('Site et application', 'Website and app'),
  description: lt(
    "Deckmend reconstitue des jeux complets de 52 cartes à partir de plusieurs paquets incomplets : fini la recherche à la main pour les magiciens qui usent leurs cartes à l'entraînement. Gratuit, sans compte, installable comme une application.",
    'Deckmend rebuilds full 52-card decks from several incomplete ones: no more searching by hand for magicians who wear out cards while practising. Free, no account, installable like an app.',
  ),
  role: ls('Conception, design et développement', 'Concept, design and development'),
  highlights: [
    highlight(
      ls('Un outil pensé pour les magiciens', 'A tool made for magicians'),
      ls(
        "Ceux qui usent leurs cartes à l'entraînement retrouvent un jeu complet sans chercher à la main.",
        'Magicians who wear out cards while practising get a full deck back without searching by hand.',
      ),
    ),
    highlight(
      ls('Gratuit, sans compte', 'Free, no account'),
      ls(
        "On l'ouvre et on s'en sert : aucune inscription, aucune authentification.",
        'Open it and use it: no sign-up, no authentication.',
      ),
    ),
    highlight(
      ls("Des données gardées sur l'appareil", 'Data kept on your device'),
      ls(
        "Tout est enregistré sur l'ordinateur ou le mobile de l'utilisateur.",
        "Everything is saved on the user's computer or mobile.",
      ),
    ),
    highlight(
      ls('Une PWA, sur ordinateur comme sur mobile', 'A PWA, on desktop and mobile'),
      ls(
        "Elle s'installe depuis le navigateur et s'utilise comme une application.",
        'It installs from the browser and works like an app.',
      ),
    ),
  ],
  tags,
  stack: ['React', 'TypeScript', 'PWA'],
  url: 'https://deckmend.pages.dev/',
  // Estimation d'après la couleur de thème du site (#F7F7F9) : à ajuster dans le Studio
  theme: {
    bg: '#F7F7F9',
    text: '#111111',
  },
  order,
  orderRank,
  publishedAt: new Date().toISOString(),
}

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' && val !== 'highlight' ? undefined : val), 2)

if (DRY_RUN) {
  console.log(`Placé en ${position} : orderRank ${orderRank} (premier actuel : ${projects[0]?._id} ${projects[0]?.orderRank}), order ${order}`)
  console.log(`\nImages (non uploadées en essai à blanc) :`)
  console.log(`  desktop → deckmend-site-desktop.png, alt « ${ALT_DESKTOP} »`)
  console.log(`  mobile  → deckmend-app-mobile.png, alt « ${ALT_MOBILE} »`)
  console.log(`\navant : (aucun document ${ID})`)
  console.log(`après : ${clean(content)}`)
  console.log('\nEssai à blanc : rien n\'est écrit, aucune image n\'est uploadée.')
  process.exit(0)
}

// 4. Upload des images (noms de fichiers ASCII côté Sanity)
const upload = (path, filename) => client.assets.upload('image', createReadStream(path), {filename})
const [desk, mob] = await Promise.all([
  upload(DESKTOP, 'deckmend-site-desktop.png'),
  upload(MOBILE, 'deckmend-app-mobile.png'),
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
