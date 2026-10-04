// Usage unique : passe le _type des entrées de highlights de localizedString à localizedText.
// Ne modifie que highlights[]._type (les _key, fr et en sont conservés).
// Essai à blanc : DRY_RUN=1 npx sanity exec scripts/migrate-highlights-to-text.js --with-user-token
// Écriture :      npx sanity exec scripts/migrate-highlights-to-text.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-10-01'})
const DRY_RUN = process.env.DRY_RUN === '1'
const FROM = 'localizedString'
const TO = 'localizedText'

// Publiés et brouillons, pour n'en oublier aucun
const docs = await client.fetch(
  `*[_type == "project" && count(highlights[_type == $from]) > 0]{_id, _rev, highlights} | order(_id)`,
  {from: FROM},
  {perspective: 'raw'},
)

if (!docs.length) {
  console.log(`Aucun projet avec des highlights de type ${FROM}, rien à faire.`)
  process.exit(0)
}

console.log(`Documents concernés : ${docs.map((d) => d._id).join(', ')}`)

const tx = client.transaction()
for (const doc of docs) {
  console.log(`\n── ${doc._id}`)
  const p = client.patch(doc._id).ifRevisionId(doc._rev)
  for (const h of doc.highlights) {
    const after = h._type === FROM ? TO : h._type
    console.log(`  [${h._key}] _type ${h._type} → ${after}`)
    console.log(`     fr : ${h.fr ?? '(vide)'}`)
    console.log(`     en : ${h.en ?? '(vide)'}`)
    if (h._type === FROM) p.set({[`highlights[_key == "${h._key}"]._type`]: TO})
  }
  tx.patch(p)
}

if (DRY_RUN) {
  console.log('\nEssai à blanc : rien n\'est écrit.')
  process.exit(0)
}

await tx.commit()
console.log(`\n✔ highlights migrés sur ${docs.length} document(s)`)
