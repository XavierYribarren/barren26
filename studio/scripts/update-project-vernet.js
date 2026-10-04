// Usage unique : met à jour les textes et l'URL de project-vernet (rien d'autre).
// Essai à blanc : DRY_RUN=1 npx sanity exec scripts/update-project-vernet.js --with-user-token
// Écriture :      npx sanity exec scripts/update-project-vernet.js --with-user-token
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-10-01'})
const ID = 'project-vernet'
const DRY_RUN = process.env.DRY_RUN === '1'

const ls = (fr, en) => ({_type: 'localizedString', fr, en})
const lt = (fr, en) => ({_type: 'localizedText', fr, en})
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const patch = {
  name: ls('Salon Vernet', 'Salon Vernet'),
  url: 'https://salon-vernet.netlify.app/',
  tagline: ls(
    "Un salon qu'on ressent avant même d'y entrer.",
    'A salon you feel before you even walk in.',
  ),
  context: lt(
    "Vernet est un salon de coiffure fictif de la rue de Turenne, à Paris. Le brief que je me suis donné : ne pas faire un site de service (liste de prestations, grille de tarifs, formulaire de contact), mais un site qui plonge le visiteur dans l'ambiance du lieu avant qu'il y mette les pieds. Le style fait le tri : la cliente qui s'y reconnaît a déjà envie de réserver. Le salon et ses réalisations sont fictifs : c'est une démo, qui montre ce que le site donnerait à un vrai salon.",
    'Vernet is a fictional hair salon on rue de Turenne in Paris. The brief I set myself: not a service website (list of services, price grid, contact form), but a site that immerses visitors in the atmosphere of the place before they set foot in it. The style does the sorting: a client who sees herself in it already wants to book. The salon and its work are fictional: this is a demo, showing what the site would do for a real salon.',
  ),
  highlights: [
    ls(
      "Une page d'accueil traitée comme une affiche : le mot « vernet » en format XXL passe derrière le portrait, une grotesque très lourde face à un serif rose à fort contraste.",
      'A home page treated like a poster: the word “vernet” runs XXL behind the portrait, a very heavy grotesque set against a high-contrast pink serif.',
    ),
    ls(
      "Des résultats montrés plutôt que promis : les réalisations sont mises en avant à côté des prestations, pour qu'on voie ce que le salon sait faire avant de lire quoi que ce soit.",
      "Results shown rather than promised: the salon's work is showcased alongside its services, so you see what it can do before reading a single word.",
    ),
    ls(
      "Un chemin court vers la conversion : trois entrées de navigation et un seul appel à l'action, « Rendez-vous », toujours visible.",
      'A short path to conversion: three navigation items and a single call to action, “Rendez-vous”, always in view.',
    ),
  ].map((h) => ({_key: key(), ...h})),
  clientControl: lt(
    "Dans l'idée, le salon aurait lui aussi accès à Sanity. Sans toucher au code, il pourrait ajouter une bannière (promotion, congés, nouveauté), renouveler les photos de ses réalisations et mettre à jour les prix de ses prestations.",
    'The idea is that the salon would have access to Sanity too. Without touching the code, it could add a banner (promotion, holiday closure, something new), refresh the photos of its work and update the prices of its services.',
  ),
}

const FIELDS = Object.keys(patch)
const projection = `{_rev, stack, ${FIELDS.join(', ')}}`

const before = await client.fetch(`*[_id == $id][0]${projection}`, {id: ID})
if (!before) {
  console.error(`✖ ${ID} introuvable, rien n'est modifié.`)
  process.exit(1)
}
const draft = await client.fetch('*[_id == $id][0]._id', {id: `drafts.${ID}`})
if (draft) console.warn(`⚠ Brouillon en cours (non modifié) : publier ce brouillon écraserait ces changements`)

// Affichage sans les _type / _key pour la lecture
const clean = (v) => JSON.stringify(v, (k, val) => (k === '_type' || k === '_key' ? undefined : val), 2)
for (const field of FIELDS) {
  console.log(`\n── ${field}`)
  console.log(`avant : ${clean(before[field] ?? null)}`)
  console.log(`après : ${clean(patch[field])}`)
}
console.log(`\nstack actuel (non modifié) : ${JSON.stringify(before.stack ?? null)}`)

if (DRY_RUN) {
  console.log('\nEssai à blanc : rien n\'est écrit.')
  process.exit(0)
}

// ifRevisionId : échoue si le document a changé depuis la lecture ci-dessus
await client.patch(ID).ifRevisionId(before._rev).set(patch).commit()
console.log(`\n✔ ${ID} mis à jour (${FIELDS.join(', ')})`)
