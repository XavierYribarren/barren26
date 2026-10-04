// Convertit un projet Sanity vers la forme déjà attendue par Projects, ProjectModal et la page détail
function toImage(img) {
  const url = img?.asset?.url
  if (!url) return null
  const { width, height } = img.asset.metadata?.dimensions ?? {}
  return { src: url, width, height, lqip: img.asset.metadata?.lqip, alt: img.alt }
}

export function toLegacyProject(p) {
  const deskImage = toImage(p.coverDesktop)
  const mobImage = toImage(p.coverMobile)
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    role: p.role,
    stack: p.stack,
    url: p.url ?? null,
    tags: p.tags,
    desk: deskImage?.src ?? null,
    mob: mobImage?.src ?? null,
    deskImage,
    mobImage,
  }
}
