// Usage unique, idempotent : écrit le champ tags des projets publiés (rien d'autre).
// nvm use 22 && npx sanity exec scripts/set-project-tags.js --with-user-token
import {getCliClient} from 'sanity/cli'
import {tagOptions} from '../schemaTypes/tagOptions.js'

const client = getCliClient({apiVersion: '2025-10-01'})

const TAGS = {
  restaurant: ['vitrine', 'cms'],
  configurateur: ['web-app', '3d'],
  boutique: ['e-commerce', 'animation'],
  psychologue: ['vitrine', 'animation'],
  webamp: ['web-app', 'audio', '3d'],
  musicroom: ['web-app', '3d', 'audio'],
}

const allowed = new Set(tagOptions.map((t) => t.value))
const unknown = Object.values(TAGS).flat().filter((t) => !allowed.has(t))
if (unknown.length) {
  console.error(`✖ Tags absents de tagOptions : ${[...new Set(unknown)].join(', ')}`)
  process.exit(1)
}

const ids = Object.keys(TAGS).map((slug) => `project-${slug}`)
const existing = await client.fetch('*[_id in $ids]._id', {ids})
const missing = ids.filter((id) => !existing.includes(id))
if (missing.length) {
  console.error(`✖ Documents introuvables : ${missing.join(', ')}`)
  process.exit(1)
}

// Un brouillon publié plus tard écraserait les tags écrits ici
const drafts = await client.fetch('*[_id in $ids]._id', {ids: ids.map((id) => `drafts.${id}`)})
if (drafts.length) console.warn(`⚠ Brouillons en cours (non modifiés) : ${drafts.join(', ')}`)

const tx = client.transaction()
for (const [slug, tags] of Object.entries(TAGS)) {
  tx.patch(`project-${slug}`, {set: {tags}})
}
await tx.commit()
console.log(`✔ Tags écrits sur ${ids.length} projets`)
