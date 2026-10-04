import { createImageUrlBuilder } from '@sanity/image-url'
import { projectId, dataset } from './client'

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlFor(source) {
  return builder.image(source)
}

// Loader next/image : le redimensionnement est fait par cdn.sanity.io, pas par le serveur Next
export function sanityLoader({ src, width, quality }) {
  const url = urlFor(src).width(width).auto('format')
  return (quality ? url.quality(quality) : url).url()
}
