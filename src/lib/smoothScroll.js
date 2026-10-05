// Instance Lenis partagée (null sans Lenis : reduced-motion, avant le montage)
let lenis = null

export function setLenis(instance) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

// target : 0 pour le haut de page, ou un sélecteur ('#contact')
export function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target)
    return
  }
  if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}
