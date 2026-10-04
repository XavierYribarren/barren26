// Usage unique : raccourcit description, highlights et clientControl de project-vernet (rien d'autre).
// Essai à blanc : DRY_RUN=1 npx sanity exec scripts/shorten-vernet-copy.js --with-user-token
// Écriture :      npx sanity exec scripts/shorten-vernet-copy.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-10-01'})
const ID = 'project-vernet'
const DRY_RUN = process.env.DRY_RUN === '1'

const lt = (fr, en) => ({_type: 'localizedText', fr, en})

const HIGHLIGHTS = [
  [
    "Une page d'accueil en format affiche, pour sentir le lieu avant de lire.",
    'A poster-format home page, to feel the place before reading.',
  ],
  ['Les réalisations avant la liste des prestations.', "The salon's work before the list of services."],
  ['Un seul appel à l\'action : « Rendez-vous ».', 'A single call to action: “Rendez-vous”.'],
]

const before = await client.fetch(
  '*[_id == $id][0]{_rev, description, highlights, clientControl}',
  {id: ID},
)
if (!before) {
  console.error(`✖ ${ID} introuvable, rien n'est modifié.`)
  process.exit(1)
}
if ((before.highlights ?? []).length !== HIGHLIGHTS.length) {
  console.error(`✖ ${ID} a ${before.highlights?.length ?? 0} highlights au lieu de ${HIGHLIGHTS.length}, rien n'est modifié.`)
  process.exit(1)
}
const draft = await client.fetch('*[_id == $id][0]._id', {id: `drafts.${ID}`})
if (draft) console.warn('⚠ Brouillon en cours (non modifié) : publier ce brouillon écraserait ces changements')

const patch = {
  description: lt(
    "Démo de site pour un salon de coiffure parisien fictif : l'ambiance d'abord, les prestations ensuite.",
    'Demo website for a fictional Parisian hair salon: atmosphere first, services second.',
  ),
  // Mêmes _key et même _type que les entrées existantes (localizedText depuis la migration)
  highlights: before.highlights.map((h, i) => ({
    _key: h._key,
    _type: h._type,
    fr: HIGHLIGHTS[i][0],
    en: HIGHLIGHTS[i][1],
  })),
  clientControl: lt(
    'Pensé pour que le salon le modifie lui-même, via Sanity : bannière, photos, prix.',
    'Designed so the salon can edit it themselves, via Sanity: banner, photos, prices.',
  ),
}

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' ? undefined : val), 2)
for (const field of Object.keys(patch)) {
  console.log(`\n── ${field}`)
  console.log(`avant : ${clean(before[field] ?? null)}`)
  console.log(`après : ${clean(patch[field])}`)
}
console.log(`\n_type des highlights : ${before.highlights.map((h) => h._type).join(', ')} (inchangé)`)

if (DRY_RUN) {
  console.log('\nEssai à blanc : rien n\'est écrit.')
  process.exit(0)
}

// ifRevisionId : échoue si le document a changé depuis la lecture ci-dessus
await client.patch(ID).ifRevisionId(before._rev).set(patch).commit()
console.log(`\n✔ ${ID} mis à jour (${Object.keys(patch).join(', ')})`)
