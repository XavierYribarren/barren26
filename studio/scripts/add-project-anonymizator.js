// Usage unique : crée le projet « Anonymizator » (publié) sans toucher aux autres documents.
// Essai à blanc (aucune écriture, aucun upload) :
//   DRY_RUN=1 npx sanity exec scripts/add-project-anonymizator.js --with-user-token
// Écriture :
//   npx sanity exec scripts/add-project-anonymizator.js --with-user-token
import {createReadStream, existsSync, readdirSync} from 'node:fs'
import {dirname} from 'node:path'
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {LexoRank} from 'lexorank'
import {tagOptions} from '../schemaTypes/tagOptions.js'

const client = getCliClient({apiVersion: '2025-10-01'})
const DRY_RUN = process.env.DRY_RUN === '1'

const ID = 'project-anonymizator'
const DESKTOP = '/home/barren/Images/Captures d’écran/anonymizator_desktop.png'

const fail = (msg) => {
  console.error(`✖ ${msg}`)
  process.exit(1)
}

// 1. Le visuel doit exister avant tout upload (pas de version mobile pour ce projet)
const missing = [DESKTOP].filter((p) => !existsSync(p))
if (missing.length) {
  console.error('✖ Image introuvable :')
  for (const p of missing) console.error(`  ${p}`)
  console.error(`Contenu de ${dirname(DESKTOP)} :`)
  for (const name of readdirSync(dirname(DESKTOP))) console.error(`  ${name}`)
  process.exit(1)
}

// 2. Ne jamais écraser un document existant (publié ou brouillon), ni réutiliser le slug
const existing = await client.fetch(
  '*[_id in $ids || (_type == "project" && slug.current == "anonymizator")]._id',
  {ids: [ID, `drafts.${ID}`]},
)
if (existing.length) fail(`Document déjà présent : ${existing.join(', ')}. Rien n'est modifié.`)

const tags = ['web-app']
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

// Décrit d'après le visuel
const ALT_DESKTOP = 'Visuel du projet : le nom Anonymizator en lettres métalliques sur fond noir, avec un cadenas à la place du O'

const content = {
  _id: ID,
  _type: 'project',
  name: ls('Anonymizator', 'Anonymizator'),
  slug: {_type: 'slug', current: 'anonymizator'},
  category: ls('Outil open source', 'Open source tool'),
  description: lt(
    "Anonymizator permet de recueillir des fichiers sensibles sans que le serveur puisse les lire. Le chercheur génère une paire de clés et partage un lien d'envoi : le fichier est chiffré dans le navigateur de la personne qui l'envoie, et seul le chercheur peut le déchiffrer. Né au sein du LabEx ASLAN (CNRS), open source et auto-hébergeable.",
    "Anonymizator lets you collect sensitive files without the server being able to read them. The researcher generates a key pair and shares an upload link: the file is encrypted in the sender's browser, and only the researcher can decrypt it. Started within the ASLAN LabEx (CNRS), open source and self-hostable.",
  ),
  role: ls('Conception, design et développement', 'Concept, design and development'),
  highlights: [
    highlight(
      ls('Un serveur qui ne peut pas lire les fichiers', 'A server that cannot read the files'),
      ls(
        "Même compromis, il ne stocke que des fichiers chiffrés, inutilisables sans la clé privée du chercheur.",
        "Even if compromised, it only holds encrypted files, useless without the researcher's private key.",
      ),
    ),
    highlight(
      ls('Chiffrement dans le navigateur', 'Encryption in the browser'),
      ls(
        "Le fichier est chiffré (RSA-4096 et AES-256-GCM) avec la Web Crypto API avant de quitter l'appareil de la personne qui l'envoie.",
        "The file is encrypted (RSA-4096 and AES-256-GCM) with the Web Crypto API before leaving the sender's device.",
      ),
    ),
    highlight(
      ls("Simple pour qui l'envoie", 'Simple for the sender'),
      ls(
        'Un lien à ouvrir, un fichier à déposer : pas besoin de comprendre le chiffrement.',
        'Open a link, drop a file: no need to understand encryption.',
      ),
    ),
    highlight(
      ls('Open source, auto-hébergeable', 'Open source, self-hostable'),
      ls(
        "Licence MIT : le code se lit, s'audite et se déploie sur son propre serveur.",
        'MIT license: the code can be read, audited and deployed on your own server.',
      ),
    ),
  ],
  tags,
  stack: ['Python', 'FastAPI', 'JavaScript', 'Web Crypto API'],
  context: lt(
    "Imaginé pour la recherche, par exemple pour recueillir des données médicales ou des données de terrain, mais utilisable dès qu'une personne non technique doit envoyer un fichier sensible. L'instance en ligne est une démonstration.",
    "Designed for research, for example collecting medical or field data, but usable whenever a non-technical person needs to send a sensitive file. The online instance is a demo.",
  ),
  url: 'https://anonymizator.netlify.app/',
  // Estimation d'après le visuel (pixels relevés) : à ajuster dans le Studio
  theme: {bg: '#05070a', text: '#e8e8ea', stage: '#05070a'},
  order,
  orderRank,
  publishedAt: new Date().toISOString(),
}

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' && val !== 'highlight' ? undefined : val), 2)

if (DRY_RUN) {
  console.log(`Placé en ${position} : orderRank ${orderRank} (premier actuel : ${projects[0]?._id} ${projects[0]?.orderRank}), order ${order}`)
  console.log(`\nImage (non uploadée en essai à blanc) :`)
  console.log(`  desktop → anonymizator-desktop.png, alt « ${ALT_DESKTOP} »`)
  console.log(`\navant : (aucun document ${ID})`)
  console.log(`après : ${clean(content)}`)
  console.log('\nEssai à blanc : rien n\'est écrit, aucune image n\'est uploadée.')
  process.exit(0)
}

// 4. Upload des images (noms de fichiers ASCII côté Sanity)
const upload = (path, filename) => client.assets.upload('image', createReadStream(path), {filename})
const desk = await upload(DESKTOP, 'anonymizator-desktop.png')

const doc = {
  ...content,
  coverDesktop: {_type: 'image', asset: {_type: 'reference', _ref: desk._id}, alt: ALT_DESKTOP},
}

// createIfNotExists : filet de sécurité si le document est apparu entre-temps
await client.transaction().createIfNotExists(doc).commit()
const created = await client.fetch('*[_id == $id][0]{orderRank}', {id: ID})
if (created?.orderRank !== orderRank) fail('Un document existant a été trouvé à la création, il n\'a pas été modifié.')

console.log(`✔ ${ID} créé, placé en ${position} (orderRank ${orderRank}, order ${order})`)
console.log(`  image : ${desk._id}`)
