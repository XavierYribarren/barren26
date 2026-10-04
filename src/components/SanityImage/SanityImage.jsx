'use client'
import Image from 'next/image'
import { sanityLoader } from '../../lib/sanity/image'

// Client component : le loader (une fonction) ne peut pas être passé depuis un Server Component
export default function SanityImage({ image, alt, className, sizes }) {
  if (!image?.src) return null
  return (
    <Image
      loader={sanityLoader}
      src={image.src}
      width={image.width}
      height={image.height}
      alt={image.alt || alt}
      className={className}
      sizes={sizes}
      placeholder={image.lqip ? 'blur' : 'empty'}
      blurDataURL={image.lqip}
      // La hauteur suit l'aspect-ratio du CSS existant, comme avec l'ancien <img>
      style={{ height: 'auto' }}
    />
  )
}
