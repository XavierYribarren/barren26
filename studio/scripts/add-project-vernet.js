// Usage unique : crée le projet « Vernet » (publié) sans toucher aux autres documents.
// nvm use 22 && npx sanity exec scripts/add-project-vernet.js --with-user-token
import {createReadStream, existsSync, readdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {LexoRank} from 'lexorank'
import {tagOptions} from '../schemaTypes/tagOptions.js'

const client = getCliClient({apiVersion: '2025-10-01'})

const ID = 'project-vernet'
const DESKTOP = '/home/barren/Images/Captures d’écran/salon-vernet_desktop.png'
const MOBILE = '/home/barren/Images/Captures d’écran/salon-vernet_mobile.png'

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

// 2. Ne jamais écraser un document existant (publié ou brouillon)
const existing = await client.fetch('*[_id in $ids]._id', {ids: [ID, `drafts.${ID}`]})
if (existing.length) fail(`Document déjà présent : ${existing.join(', ')}. Rien n'est modifié.`)

const tags = ['vitrine']
const allowed = new Set(tagOptions.map((t) => t.value))
if (tags.some((t) => !allowed.has(t))) fail('Tag absent de tagOptions')

// 3. Rang avant le premier projet, même bibliothèque que init-order-rank.js
const projects = await client.fetch(
  '*[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank asc){_id, order, orderRank}',
)
const first = projects[0]
let orderRank
let position = 'premier'
const firstRank = first?.orderRank ? LexoRank.parse(first.orderRank) : null
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

// 4. Upload des images (noms de fichiers ASCII côté Sanity)
const upload = (path, filename) => client.assets.upload('image', createReadStream(path), {filename})
const [desk, mob] = await Promise.all([
  upload(DESKTOP, 'vernet-desktop.png'),
  upload(MOBILE, 'vernet-mobile.png'),
])

const ls = (fr, en) => ({_type: 'localizedString', fr, en})
const lt = (fr, en) => ({_type: 'localizedText', fr, en})
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const doc = {
  _id: ID,
  _type: 'project',
  name: ls('Vernet', 'Vernet'),
  slug: {_type: 'slug', current: 'vernet'},
  category: ls('Site vitrine', 'Showcase site'),
  tagline: ls(
    'Un mot-symbole géant, un portrait qui le traverse.',
    'A giant wordmark, a portrait cutting through it.',
  ),
  description: lt(
    "Démo de site pour un salon de coiffure parisien fictif. Une page d'accueil traitée comme une affiche de mode.",
    'Demo website for a fictional Parisian hair salon. A home page treated like a fashion poster.',
  ),
  role: ls('Conception, design et développement', 'Concept, design and development'),
  context: lt(
    "Vernet est un salon fictif de la rue de Turenne, à Paris : coupe, couleur et soin du cheveu. Le brief imaginé : un site qui ait la présence d'une affiche, et qui mène vite à la prise de rendez-vous.",
    'Vernet is a fictional salon on rue de Turenne in Paris: cuts, colour and hair care. The imagined brief: a website with the presence of a poster, that quickly leads visitors to book an appointment.',
  ),
  highlights: [
    {
      _key: key(),
      ...ls(
        'Le mot « vernet » en format XXL passe derrière le portrait, et une partie des lettres bascule en négatif là où la silhouette les recouvre.',
        'The word “vernet” runs XXL behind the portrait, and part of the letters flips to negative where the silhouette overlaps them.',
      ),
    },
    {
      _key: key(),
      ...ls(
        'Deux voix typographiques : une grotesque très lourde pour la marque, un serif à fort contraste en rose pour « coiffure ».',
        'Two typographic voices: a very heavy grotesque for the brand, and a high-contrast pink serif for “coiffure”.',
      ),
    },
    {
      _key: key(),
      ...ls(
        "Une palette retenue (papier gris légèrement texturé, noir, un seul rose) et une navigation réduite à trois entrées et un appel à l'action : « Rendez-vous ».",
        'A restrained palette (lightly textured grey paper, black, a single pink) and navigation pared down to three items and one call to action: “Rendez-vous”.',
      ),
    },
  ],
  tags,
  theme: {bg: '#ececec', text: '#0b0b0b', accent: '#f896bb', fontDisplay: 'Archivo Black'},
  coverDesktop: {
    _type: 'image',
    asset: {_type: 'reference', _ref: desk._id},
    alt: "Page d'accueil du site Vernet : le mot « vernet » en très gros derrière le portrait d'une femme de profil",
  },
  coverMobile: {
    _type: 'image',
    asset: {_type: 'reference', _ref: mob._id},
    alt: "Version mobile de la page d'accueil du site Vernet",
  },
  order,
  orderRank,
  publishedAt: new Date().toISOString(),
}

// createIfNotExists : filet de sécurité si le document est apparu entre-temps
await client.transaction().createIfNotExists(doc).commit()
const created = await client.fetch('*[_id == $id][0]{_rev, orderRank}', {id: ID})
if (created?.orderRank !== orderRank) fail('Un document existant a été trouvé à la création, il n\'a pas été modifié.')

console.log(`✔ ${ID} créé, placé en ${position} (orderRank ${orderRank}, order ${order})`)
console.log(`  images : ${desk._id}, ${mob._id}`)
