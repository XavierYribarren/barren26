import {defineField, defineType} from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Texte court (FR / EN)',
  type: 'object',
  fields: [
    defineField({name: 'fr', title: 'Français', type: 'string'}),
    defineField({name: 'en', title: 'English', type: 'string'}),
  ],
})
