// Usage unique : initialise orderRank des projets d'après le champ order.
// nvm use 22 && npx sanity exec scripts/init-order-rank.js --with-user-token
import {getCliClient} from 'sanity/cli'
import {LexoRank} from 'lexorank'

const client = getCliClient({apiVersion: '2025-10-01'})

const projects = await client.fetch(
  '*[_type == "project" && !(_id in path("drafts.**"))] | order(order asc, _createdAt asc){_id, order, orderRank}',
)

if (projects.some((p) => p.orderRank)) {
  console.error('✖ orderRank déjà présent sur au moins un projet, rien n\'est modifié.')
  process.exit(1)
}

let rank = LexoRank.min()
const tx = client.transaction()
for (const p of projects) {
  rank = rank.genNext().genNext()
  tx.patch(p._id, {set: {orderRank: rank.toString()}})
  console.log(`  ${String(p.order).padStart(2)}  ${p._id}  →  ${rank.toString()}`)
}
await tx.commit()
console.log(`✔ orderRank initialisé sur ${projects.length} projets`)
