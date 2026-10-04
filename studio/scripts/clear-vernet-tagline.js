// Usage unique : retire le champ tagline de project-vernet (rien d'autre).
// Essai à blanc : DRY_RUN=1 npx sanity exec scripts/clear-vernet-tagline.js --with-user-token
// Écriture :      npx sanity exec scripts/clear-vernet-tagline.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-10-01'})
const ID = 'project-vernet'
const FIELD = 'tagline'
const DRY_RUN = process.env.DRY_RUN === '1'

const before = await client.fetch(`*[_id == $id][0]{_rev, ${FIELD}}`, {id: ID})
if (!before) {
  console.error(`✖ ${ID} introuvable, rien n'est modifié.`)
  process.exit(1)
}
const draft = await client.fetch('*[_id == $id][0]._id', {id: `drafts.${ID}`})
if (draft) console.warn('⚠ Brouillon en cours (non modifié) : publier ce brouillon remettrait la tagline')

const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' ? undefined : val), 2)
console.log(`── ${FIELD}`)
console.log(`avant : ${clean(before[FIELD] ?? null)}`)
console.log('après : (champ absent)')

if (before[FIELD] === undefined) {
  console.log('\nDéjà absent, rien à faire.')
  process.exit(0)
}

if (DRY_RUN) {
  console.log('\nEssai à blanc : rien n\'est écrit.')
  process.exit(0)
}

// ifRevisionId : échoue si le document a changé depuis la lecture ci-dessus
await client.patch(ID).ifRevisionId(before._rev).unset([FIELD]).commit()
console.log(`\n✔ ${FIELD} retiré de ${ID}`)
