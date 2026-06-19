// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Astro 6 (stabil seit März 2026). Mindest-Node: ^22.12.0 || ^24.0.0
// https://astro.build/config
export default defineConfig({
  // Domain des Vereins – VOR Livegang setzen.
  // Wird für Sitemap, Canonical-URLs und absolute Links gebraucht.
  site: 'https://gemeinsam-wirkt.example',

  // Statischer Output ist Default – passt exakt zum Hetzner Webhosting.
  output: 'static',

  // Mehrsprachigkeit: DE jetzt, EN strukturell vorbereitet (noch nicht befüllt).
  // prefixDefaultLocale: false  →  Deutsch ohne Präfix (/ueber-uns),
  //                               Englisch unter /en/ (/en/about).
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Einheitliche URLs ohne abschließenden Slash.
  trailingSlash: 'never',

  // Sitemap für SEO. Benötigt einmalig:  npx astro add sitemap
  integrations: [sitemap()],

  // Bild-Optimierung: die Standard-Pipeline (sharp) genügt für statische Builds.
});
