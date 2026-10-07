// Coordination du landing entre le Loader et le hero.
// heroReady : les lettres définitives du hero sont prêtes (scène 3D, ou repli SVG décidé).
// heroIntro : le Loader a commencé l'intro (il s'est retiré) ; le hero lance alors sa propre entrée.
let resolveReady
export const heroReady = new Promise((r) => { resolveReady = r })
export const markHeroReady = () => resolveReady()

let resolveIntro
export const heroIntro = new Promise((r) => { resolveIntro = r })
export const markHeroIntro = () => resolveIntro()
