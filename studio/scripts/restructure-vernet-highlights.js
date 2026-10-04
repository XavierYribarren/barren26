// Usage unique : passe les highlights de project-vernet au type « highlight » (title + benefit)
// et renseigne theme.stage. Rien d'autre n'est modifié, aucun autre document.
// Essai à blanc : DRY_RUN=1 npx sanity exec scripts/restructure-vernet-highlights.js --with-user-token
// Écriture :      npx sanity exec scripts/restructure-vernet-highlights.js --with-user-token
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-10-01'})
const ID = 'project-vernet'
const STAGE = '#0b0b0b'
const DRY_RUN = process.env.DRY_RUN === '1'

const ls = (fr, en) => ({_type: 'localizedString', fr, en})
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const HIGHLIGHTS = [
  {
    title: ls("Une page d'accueil en format affiche", 'A poster-format home page'),
    benefit: ls(
      "L'ambiance fait le tri : la cliente qui s'y reconnaît a déjà envie de réserver.",
      'The mood does the filtering: a client who sees herself in it already wants to book.',
    ),
  },
  {
    title: ls('Les réalisations avant les prestations', 'Work before services'),
    benefit: ls(
      'On voit le résultat avant de lire la liste.',
      'Visitors see the result before they read the list.',
    ),
  },
  {
    title: ls('Un seul appel à l\'action', 'A single call to action'),
    benefit: ls(
      '« Rendez-vous », toujours visible : un seul chemin vers la réservation.',
      '“Rendez-vous”, always in view: one clear path to booking.',
    ),
  },
  {
    title: ls('Modifiable par le salon', 'Editable by the salon'),
    benefit: ls(
      'Bannière, photos, prix : il les met à jour lui-même via Sanity, sans toucher au code.',
      'Banner, photos, prices: they update them themselves via Sanity, no code needed.',
    ),
  },
].map((h) => ({_key: key(), _type: 'highlight', ...h}))

// 1. Projets qui ont déjà des highlights (brouillons compris) : seuls ceux de Vernet sont modifiés
const withHighlights = await client.fetch(
  '*[_type == "project" && count(highlights) > 0]{_id, "n": count(highlights), "types": array::unique(highlights[]._type)} | order(_id)',
  {},
  {perspective: 'raw'},
)
console.log('Projets avec des highlights :')
for (const p of withHighlights) console.log(`  ${p._id} : ${p.n} entrée(s), type ${p.types.join(', ')}`)
const others = withHighlights.filter((p) => p._id !== ID)
if (others.length) {
  console.warn(`⚠ Autres projets avec des highlights (non modifiés) : ${others.map((p) => p._id).join(', ')}`)
}

const before = await client.fetch('*[_id == $id][0]{_rev, highlights, "stage": theme.stage}', {id: ID})
if (!before) {
  console.error(`✖ ${ID} introuvable, rien n'est modifié.`)
  process.exit(1)
}
const draft = await client.fetch('*[_id == $id][0]._id', {id: `drafts.${ID}`})
if (draft) console.warn('⚠ Brouillon en cours (non modifié) : publier ce brouillon écraserait ces changements')

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' && val !== 'highlight' ? undefined : val), 2)
console.log('\n── highlights')
console.log(`avant : ${clean(before.highlights ?? null)}`)
console.log(`après : ${clean(HIGHLIGHTS)}`)
console.log('\n── theme.stage')
console.log(`avant : ${JSON.stringify(before.stage ?? null)}`)
console.log(`après : ${JSON.stringify(STAGE)}`)

if (DRY_RUN) {
  console.log('\nEssai à blanc : rien n\'est écrit.')
  process.exit(0)
}

// ifRevisionId : échoue si le document a changé depuis la lecture ci-dessus
await client
  .patch(ID)
  .ifRevisionId(before._rev)
  .set({highlights: HIGHLIGHTS, 'theme.stage': STAGE})
  .commit()
console.log(`\n✔ ${ID} mis à jour (highlights, theme.stage)`)
