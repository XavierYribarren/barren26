// Textes localisés : langue demandée, repli sur le français
const loc = (field) => `"${field}": coalesce(${field}[$locale], ${field}.fr)`

const image = `{
  alt,
  hotspot,
  crop,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height, aspectRatio } }
  }
}`

const projectFields = `
  _id,
  "slug": slug.current,
  ${loc('name')},
  ${loc('category')},
  ${loc('tagline')},
  ${loc('description')},
  ${loc('role')},
  ${loc('context')},
  "highlights": coalesce(highlights[]{ "text": coalesce(@[$locale], fr) }.text, []),
  "tags": coalesce(tags, []),
  "stack": coalesce(stack, []),
  url,
  theme { bg, text, accent, fontDisplay },
  publishedAt,
  coverDesktop ${image},
  coverMobile ${image},
  "gallery": coalesce(gallery[] ${image}, [])
`

const published = '_type == "project" && defined(slug.current)'
const ordering = 'order(orderRank asc, order asc)'

export const PROJECTS_QUERY = `*[${published}] | ${ordering} { ${projectFields} }`

export const PROJECT_BY_SLUG_QUERY = `*[${published} && slug.current == $slug][0] { ${projectFields} }`

export const PROJECT_SLUGS_QUERY = `*[${published}] | ${ordering} { "slug": slug.current, _updatedAt }`
