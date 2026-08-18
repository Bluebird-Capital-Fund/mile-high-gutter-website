// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Canonical production URL (www) — matches astro-site/vercel.json host redirect */
const site = 'https://www.milehighgutter.com';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  redirects: {
    '/projects': '/gallery/',
    '/projects/': '/gallery/',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/lp/'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
