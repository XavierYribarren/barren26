import {defineField, defineType} from 'sanity'

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Texte long (FR / EN)',
  type: 'object',
  fields: [
    defineField({name: 'fr', title: 'Français', type: 'text', rows: 4}),
    defineField({name: 'en', title: 'English', type: 'text', rows: 4}),
  ],
})
