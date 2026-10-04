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
  // Format actuel { title, benefit } ; ancien format (texte localisé) lu comme title seul
  "highlights": coalesce(highlights[]{
    "title": select(
      _type == "highlight" => coalesce(title[$locale], title.fr),
      coalesce(@[$locale], fr)
    ),
    "benefit": select(_type == "highlight" => coalesce(benefit[$locale], benefit.fr))
  }, []),
  // Entrées en simple chaîne (très ancien format) : la projection ci-dessus les rend null
  "highlightStrings": coalesce(highlights[string::startsWith(@, "")], []),
  ${loc('clientControl')},
  "tags": coalesce(tags, []),
  "stack": coalesce(stack, []),
  url,
  theme { bg, text, accent, stage, fontDisplay },
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
