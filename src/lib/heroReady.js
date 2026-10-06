// Le hero signale quand ses lettres définitives sont affichées (scène 3D prête, ou repli SVG décidé).
// Le Loader de la page d'accueil attend ce signal avant de se retirer.
let resolve
export const heroReady = new Promise((r) => { resolve = r })
export const markHeroReady = () => resolve()
