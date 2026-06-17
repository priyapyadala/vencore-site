// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const NOINDEX_PATHS = ['/thank-you/', '/privacy/', '/terms/'];

export default defineConfig({
  site: 'https://vencoredesign.co',
  redirects: {
    '/services/office': '/services/commercial',
  },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((p) => page.endsWith(p)),
    }),
  ],
  build: {
    format: 'directory',
  },
});
