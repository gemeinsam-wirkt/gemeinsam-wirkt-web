# gemeinsam wirkt e.V. – Website

Statische, wartungsarme Vereins-Website auf Basis von **Astro**. Inhalte werden
über **Sveltia CMS** (`/admin`) gepflegt, die Suche läuft clientseitig über
**Pagefind** (wird erst nach Abnahme des Gerüsts eingebunden). Deutsch ist die
Standardsprache, Englisch ist strukturell vorbereitet, aber noch nicht befüllt.

> Verbindliche Projektkonventionen (Stack, Designsystem, Brand Voice, IA) stehen
> in [`CLAUDE.md`](./CLAUDE.md). Diese Datei ist nur die Kurzanleitung.

## Befehle

| Befehl              | Wirkung                                          |
| :------------------ | :----------------------------------------------- |
| `npm install`       | Abhängigkeiten installieren                      |
| `npm run dev`       | Dev-Server auf `localhost:4321`                  |
| `npm run build`     | Produktions-Build nach `./dist/`                 |
| `npm run preview`   | Build lokal ansehen                              |
| `npx astro check`   | Typprüfung                                       |

## Struktur

```
src/
├─ components/   Tile, Header, Footer, Card, EventCard, NewsletterForm, …
├─ layouts/      BaseLayout (head, Schriften, Header/Footer), PageLayout
├─ pages/        Seitenbaum gemäß Informationsarchitektur (CLAUDE.md §3)
├─ content.config.ts   Content Collections + Zod-Schemata
├─ content/      veranstaltungen/ news/ projekte/ podcast/  (Markdown)
├─ data/partner/ Partner & Sponsoren (eine JSON-Datei je Eintrag)
├─ styles/       tokens.css (Design-Tokens) + global.css
└─ i18n/         ui.ts (Strings), nav.ts (IA), utils.ts (Locale-Helfer)
public/
├─ admin/        Sveltia CMS (index.html + config.yml)
└─ partner/      Logo-Platzhalter
```

## Inhalte pflegen

- **Veranstaltungen, News, Projekte, Podcast, Partner:** über `/admin` (Sveltia)
  oder direkt als Datei im jeweiligen Ordner unter `src/`.
- **Statische Seiten** (Zweck, Über uns, Spenden, Kontakt, Impressum,
  Datenschutz): als `.astro`-Seiten unter `src/pages/` – ändern sich selten.
- `draft: true` blendet einen Eintrag vom Build aus.

## Schriften & DSGVO

Hanken Grotesk (Display) und Atkinson Hyperlegible (Fließtext) werden über
Fontsource **selbst gehostet** und in den Build gebündelt – kein Google-CDN. Die
Seite ist statisch, cookiefrei und ohne Tracker.

## Noch offen (vor Livegang)

- Sveltia-OAuth-Worker einrichten und `base_url` in `public/admin/config.yml` setzen.
- Newsletter-ESP wählen und das Formular in `NewsletterForm.astro` anbinden.
- Pagefind-Suche und GitHub-Actions-Deployment (Hetzner) ergänzen.
- Impressum/Datenschutz/Kontakt mit echten Angaben füllen, `site` in
  `astro.config.mjs` auf die echte Domain setzen.
- Platzhaltertexte und -logos durch finale Inhalte ersetzen.
