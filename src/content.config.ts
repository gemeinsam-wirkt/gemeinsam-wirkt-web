// Speicherort in Astro 5/6:  src/content.config.ts
// (NICHT mehr src/content/config.ts – der alte Pfad wird ab Astro 6 nicht mehr unterstützt.)

import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * Hinweise:
 * - Der Markdown-BODY jeder Datei ist der eigentliche Fließtext (per render() ausgegeben).
 *   Die Schemata beschreiben nur das Frontmatter (die Metadaten oben in der Datei).
 * - z.coerce.date() wandelt einen Datums-String aus dem Frontmatter automatisch in ein
 *   echtes Date-Objekt um (sonst schlägt der Vergleich/Format im Template fehl).
 * - URL-Felder sind bewusst nur z.string() (kein .url()), damit es unabhängig von der
 *   Zod-Version (Astro 6 nutzt Zod v4) zuverlässig baut. Bei Bedarf später verschärfen.
 * - draft: true blendet Einträge vom Build aus – praktisch für Vorschauen.
 */

// Veranstaltungen und Termine — per Sveltia pflegbar
const veranstaltungen = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/veranstaltungen' }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      start: z.coerce.date(),
      ende: z.coerce.date().optional(),
      ort: z.string(),
      kurzbeschreibung: z.string(),
      anmeldungUrl: z.string().optional(), // externer Anmelde-/Ticketlink
      bild: image().optional(),
      draft: z.boolean().default(false),
    }),
});

// News / Aktuelles — per Sveltia pflegbar
const news = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      datum: z.coerce.date(),
      teaser: z.string(),
      bild: image().optional(),
      draft: z.boolean().default(false),
    }),
});

// Projekte — per Sveltia pflegbar
const projekte = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projekte' }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      zusammenfassung: z.string(),
      status: z.enum(['geplant', 'laufend', 'abgeschlossen']).default('laufend'),
      // Verknüpfung zur partner-Collection (über deren id):
      partner: z.array(reference('partner')).optional(),
      bild: image().optional(),
      draft: z.boolean().default(false),
    }),
});

// Podcast-Episoden — per Sveltia pflegbar; Transkript = Markdown-Body
const podcast = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/podcast' }),
  schema: z.object({
    titel: z.string(),
    episodennummer: z.number(),
    datum: z.coerce.date(),
    embedUrl: z.string(), // Einbettungs-URL des Podcast-Hosts
    beschreibung: z.string(),
    gaeste: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

// Kooperationspartner & Sponsoren — einfache Datenliste aus einer JSON-Datei
// (src/data/partner.json: Array von Objekten mit den unten definierten Feldern)
const partner = defineCollection({
  loader: file('src/data/partner.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    typ: z.enum(['kooperationspartner', 'sponsor']),
    url: z.string().optional(),
    logo: z.string().optional(), // Pfad, z. B. /partner/logo-xy.svg in /public
  }),
});

export const collections = { veranstaltungen, news, projekte, podcast, partner };
