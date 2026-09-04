// Speicherort in Astro 5/6:  src/content.config.ts
// (NICHT mehr src/content/config.ts – der alte Pfad wird ab Astro 6 nicht mehr unterstützt.)

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

/**
 * Bild-Feld für die per Sveltia gepflegten Collections.
 *
 * Es gibt im CMS zwei Wege, ein Bild zu setzen, und beide müssen bauen:
 *  1. Über das Bild-Feld der Collection → die Datei landet NEBEN der Markdown-Datei
 *     und wird als relativer Pfad geschrieben ("foto.jpg"). Diesen Fall übernimmt
 *     Astros image()-Helfer: er optimiert das Bild und liefert ImageMetadata.
 *  2. Über die globale Medienbibliothek → die Datei landet in public/uploads und
 *     wird als absoluter Pfad geschrieben ("/uploads/foto.jpg"). Solche Dateien
 *     kann image() NICHT auflösen (public/ wird unverändert ausgeliefert, nicht
 *     gebündelt) – ein solcher Pfad hat den Build bisher abgebrochen.
 *
 * Deshalb: absolute Pfade zuerst als reinen String durchreichen, alles andere an
 * image() geben. In den Templates unterscheidet <ContentImage> die beiden Fälle.
 * Nebeneffekt (gewollt): ein Tippfehler im Pfad führt zu einem fehlenden Bild,
 * nicht mehr zu einem fehlgeschlagenen Deployment.
 */
const bildFeld = (image: () => z.ZodType) =>
  z.union([z.string().startsWith('/'), image()]).optional();

// Veranstaltungen und Termine — per Sveltia pflegbar
const veranstaltungen = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/veranstaltungen' }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      start: z.coerce.date(),
      // Sveltia schreibt ein leeres optionales Feld als "" – das ist kein gültiges
      // Datum und würde den Build brechen. Leerstring vor der Prüfung zu undefined
      // normalisieren, damit ein leeres „Ende"-Feld unproblematisch ist.
      ende: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date().optional()),
      ort: z.string(),
      kurzbeschreibung: z.string(),
      anmeldungUrl: z.string().optional(), // externer Anmelde-/Ticketlink
      bild: bildFeld(image),
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
      bild: bildFeld(image),
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
      bild: bildFeld(image),
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

// Kooperationspartner & Sponsoren — eine JSON-Datei pro Eintrag.
// Folder-Collection statt einer Sammeldatei: so lässt sich jeder Eintrag sauber
// im CMS pflegen UND als Ziel der Projekt-Relation referenzieren (Reference = id =
// Dateiname ohne Endung, z. B. src/data/partner/stadt-musterstadt.json → id
// "stadt-musterstadt").
const partner = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/data/partner' }),
  schema: z.object({
    name: z.string(),
    typ: z.enum(['kooperationspartner', 'sponsor']),
    url: z.string().optional(),
    logo: z.string().optional(), // Pfad, z. B. /partner/logo-xy.svg in /public
    beschreibung: z.string().optional(), // ergänzende Info: wer sie sind, was sie machen
  }),
});

// Vorstand — eine JSON-Datei pro Person (Folder-Collection wie partner).
// Fotos liegen in public/team, im JSON steht der öffentliche Pfad (z. B. /team/xy.jpg).
const vorstand = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/data/vorstand' }),
  schema: z.object({
    name: z.string(),
    rolle: z.string(),
    // Steuert die Anzeige-Reihenfolge auf der Über-uns-Seite (kleinste zuerst).
    reihenfolge: z.number().default(99),
    foto: z.string().optional(), // Pfad in /public, z. B. /team/michael-thiel.jpg
    bio: z.string(),
  }),
});

// Materialien & Veröffentlichungen — eine JSON-Datei pro Eintrag.
// Nur Verweise auf EXTERNE Quellen (Videos, Nextcloud-Freigaben, Dokumente),
// damit nichts auf dem eigenen Server gehostet werden muss.
const materialien = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/data/materialien' }),
  schema: z.object({
    titel: z.string(),
    typ: z.enum(['video', 'dokument', 'audio', 'link']).default('link'),
    // Entweder ein externer Link ODER eine selbst hochgeladene Datei. Sveltia schreibt
    // ein leeres optionales Feld als "" – deshalb vor der Pruefung zu undefined
    // normalisieren, damit ein leer gelassenes Feld nicht als Wert zaehlt.
    url: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
    datei: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
    quelle: z.string().optional(), // z. B. „YouTube", „Vimeo", Name der Quelle
    beschreibung: z.string().optional(),
    // Nur falls der Link ein (öffentlich mitteilbares) Passwort verlangt,
    // z. B. bei erzwungenem Passwortschutz einer Nextcloud-Freigabe.
    passwort: z.string().optional(),
    // Steuert die Anzeige-Reihenfolge (kleinste zuerst).
    reihenfolge: z.number().default(99),
  })
    // Ohne Ziel waere der Eintrag ein toter Link – lieber der Build meckert
    // frueh als dass auf der Website ein Titel ohne Verweis steht.
    .refine((d) => Boolean(d.datei || d.url), {
      message: 'Bitte entweder „Link (externe URL)“ oder „Eigene Datei hochladen“ ausfüllen.',
      path: ['url'],
    }),
});

export const collections = {
  veranstaltungen,
  news,
  projekte,
  podcast,
  partner,
  vorstand,
  materialien,
};
