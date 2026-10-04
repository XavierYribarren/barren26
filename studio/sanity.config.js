import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'barren26',

  projectId: 'f4o2p3x6',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Contenu')
          .items([
            orderableDocumentListDeskItem({type: 'project', title: 'Projets', S, context}),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'project'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
