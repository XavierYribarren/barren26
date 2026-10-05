// Progression de la scène du hero (0 → 1), partagée avec la nav. null = pas de scène sur la page.
let progress = null
const listeners = new Set()

export function setHeroProgress(p) {
  progress = p
  listeners.forEach((fn) => fn(p))
}

export function subscribeHeroProgress(fn) {
  listeners.add(fn)
  fn(progress)
  return () => listeners.delete(fn)
}
