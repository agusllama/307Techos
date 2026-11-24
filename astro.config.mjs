// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { siteUrl } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/reparacion-techo-peugeot-307': '/#zonas',
    '/reparacion-techo-peugeot-307/[zona]': '/[zona]',
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
  },
});