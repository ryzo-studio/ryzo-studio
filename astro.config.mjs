import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      useCdn: process.env.NODE_ENV === 'production',
      studioBasePath: '/studio',
      apiVersion: '2024-01-01',
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@sanity/ui', '@sanity/icons'],
    },
  },
});
