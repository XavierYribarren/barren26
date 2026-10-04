import {defineArrayMember, defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {tagOptions} from './tagOptions'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const hexField = (name, title) =>
  defineField({
    name,
    title,
    type: 'string',
    validation: (rule) => rule.regex(HEX, {name: 'hex'}).error('Couleur hex attendue (#rrggbb)'),
  })

const imageWithAlt = (name, title) =>
  defineField({
    name,
    title,
    type: 'image',
    options: {hotspot: true},
    fields: [defineField({name: 'alt', title: 'Texte alternatif', type: 'string'})],
  })

export const project = defineType({
  name: 'project',
  title: 'Projet',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name.fr', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'category', title: 'Catégorie', type: 'localizedString'}),
    defineField({name: 'tagline', title: 'Accroche', type: 'localizedString'}),
    defineField({name: 'description', title: 'Description', type: 'localizedText'}),
    defineField({name: 'role', title: 'Rôle', type: 'localizedString'}),
    imageWithAlt('coverDesktop', 'Capture desktop'),
    imageWithAlt('coverMobile', 'Capture mobile'),
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Texte alternatif', type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Thème',
      type: 'object',
      fields: [
        hexField('bg', 'Fond'),
        hexField('text', 'Texte'),
        hexField('accent', 'Accent'),
        hexField('stage', 'Fond derrière les captures'),
        defineField({
          name: 'fontDisplay',
          title: 'Police titre',
          type: 'string',
          options: {
            list: ['Archivo Black', 'DM Sans', 'Playfair Display', 'Space Grotesk'],
          },
        }),
      ],
    }),
    defineField({name: 'context', title: 'Contexte', type: 'localizedText'}),
    defineField({
      name: 'highlights',
      title: 'Points forts',
      type: 'array',
      of: [defineArrayMember({type: 'highlight'})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'clientControl',
      title: 'Côté salon : ce que le client peut modifier',
      type: 'localizedText',
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: tagOptions},
    }),
    defineField({name: 'url', title: 'URL', type: 'url'}),
    defineField({name: 'order', title: 'Ordre', type: 'number'}),
    defineField({name: 'publishedAt', title: 'Publié le', type: 'datetime'}),
    orderRankField({type: 'project'}),
  ],
  orderings: [
    orderRankOrdering,
    {title: 'Ordre', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name.fr', subtitle: 'category.fr', media: 'coverDesktop'},
  },
})
