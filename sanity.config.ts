import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/plugins/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID ?? 'placeholder';
const dataset = process.env.PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  name: 'ryzo-studio-cms',
  title: 'Ryzo Studio CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Events')
              .icon(() => '📅')
              .child(S.documentTypeList('event').title('All Events')),
            S.listItem()
              .title('Engagement Guides')
              .icon(() => '📖')
              .child(S.documentTypeList('guide').title('All Guides')),
            S.listItem()
              .title('Merchandise')
              .icon(() => '🛍️')
              .child(
                S.list()
                  .title('Merchandise')
                  .items([
                    S.listItem()
                      .title('Products')
                      .child(S.documentTypeList('merch').title('All Products')),
                  ])
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],
  schema: {
    types: schemaTypes,
  },
});
