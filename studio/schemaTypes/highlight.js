import {defineField, defineType} from 'sanity'

export const highlight = defineType({
  name: 'highlight',
  title: 'Point fort',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: "Ce que j'ai fait",
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'benefit',
      title: 'Ce que ça apporte au salon',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title.fr', subtitle: 'benefit.fr'},
  },
})
