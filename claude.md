# Build-Brief: Website „gemeinsam wirkt e.V.“

**Zweck dieses Dokuments:** Vollständige technische und gestalterische Vorgabe für die Prototyp-Entwicklung über Claude Code. Dieses Dokument dient zugleich als Vorlage für die `CLAUDE.md` im Repository. Der finale Claude-Code-Startprompt steht in Abschnitt 11.

**Stand:** Juni 2026 · **Repo-Org:** `mithicinco` · **Hosting:** Hetzner Webhosting

---

## 1. Rahmen & Leitprinzipien

Die Website ist im Kern **statisch**, soll **wartungsarm** sein und vom Verein **ohne tiefes technisches Wissen** in einzelnen Bereichen selbst gepflegt werden können (Veranstaltungen, News, Material, Podcast).

Wichtig für die Architekturentscheidungen: Es gibt **keine bezahlte technische Betreuung**. Die Pflege erfolgt ehrenamtlich durch den technischen Vorstand. Daraus folgen drei nicht verhandelbare Leitprinzipien:

1. **Wenige bewegliche Teile.** Keine Datenbank, kein Server-Runtime, keine laufenden Sicherheits-Patches am System. Statisches HTML, das „set and forget“ läuft.
2. **Redaktion von Technik entkoppeln.** Inhaltspflege darf nicht an einer einzelnen Person hängen. Andere Vorstands-/Geschäftsstellen-Mitglieder pflegen Inhalte über eine einfache Web-Oberfläche; die Technik dahinter bleibt unangetastet.
3. **„Langweiliger“, standardkonformer Stack + knappe Betriebsdoku.** Damit der Verein im Zweifel jemanden beauftragen *könnte*, ohne an proprietäre Speziallösungen gebunden zu sein.

---

## 2. Technologie-Stack

| Schicht | Wahl | Begründung |
|---|---|---|
| Static Site Generator | **Astro** | Statisches HTML, Content Collections als sauberes Datenmodell, komponentenbasiert (Kachel-Design exakt umsetzbar), starke i18n, sehr gut für Claude Code |
| Redaktion | **Sveltia CMS** | Git-basiert, aktiv gepflegter Decap-/Netlify-CMS-Nachfolger, Astro-kompatibel, gute i18n-Unterstützung, `/admin`-Web-UI |
| Suche | **Pagefind** | Läuft nach dem Build über die statischen Dateien, vollständig clientseitig, kein Server nötig |
| Versionierung | **GitHub** (`mithicinco`) | Inhalte versioniert, kein DB-Backup nötig |
| CI/CD | **GitHub Actions** | Build bei Push → Deployment per SFTP/rsync auf Hetzner |
| Hosting | **Hetzner Webhosting** | Statisch, inkl. Mail, EU/DSGVO, ein Provider |
| Dateien | **Nextcloud (Hetzner Storage Share)** | Material per Self-Service, öffentliche Share-Links |

**Ein bewusster Kompromiss:** Sveltia CMS braucht für den Login einen kleinen OAuth-Backend (nur GitHub/GitLab). Empfohlen: der offizielle `sveltia-cms-auth`-Worker auf Cloudflare (kostenlos, wickelt nur den Login-Handshake ab, **nicht** die Inhalte). Sobald GitHubs PKCE-Support verfügbar ist, entfällt dieser Schritt voraussichtlich. Falls der externe Worker unerwünscht ist, ist das der einzige Punkt, der bewusst zu entscheiden ist.

---

## 3. Informationsarchitektur (Quelle: Integrierter Site Planner)

Maßgeblich ist die Sitemap aus dem Site Planner. Die Kachel-Startseite aus dem Home-Dokument bleibt als **Layout-Muster** erhalten; ihre Farben und Beschriftungen sind Platzhalter und werden durch die folgende Struktur ersetzt.

```
Home
├─ Der Verein
│  ├─ Zweck
│  ├─ Wir / Über uns
│  ├─ Kooperationspartner
│  └─ News
├─ Projekte und Veranstaltungen
│  ├─ Projekte
│  ├─ Veranstaltungen und Termine
│  └─ Podcasts
├─ Materialien und Veröffentlichungen
├─ Spenden
├─ Sponsoren
├─ Kontakt
├─ Impressum
└─ Datenschutzerklärung
```

Zusätzlich: **Sprachumschalter DE/EN** oben rechts (siehe Abschnitt 7) und ein **Newsletter-Anmeldeformular** (siehe Abschnitt 5), eingebunden im Footer und ggf. als eigener Abschnitt.

> **Offene IA-Frage:** „News“ steht im Planner unter „Der Verein“. Inhaltlich passt es ebenso gut unter „Projekte und Veranstaltungen“ (neben „Aktuelles“). Vorschlag: News als eigene Collection führen und an *beiden* Stellen anteasern, kanonisch unter `/der-verein/news`.

---

## 4. Content-Modell (Astro Content Collections)

Vier per Sveltia pflegbare Collections, definiert in `src/content/config.ts` mit Zod-Schemata. Felder als Startpunkt – beim Scaffolding verfeinern.

- **`veranstaltungen`** — `titel`, `start` (datetime), `ende?`, `ort`, `kurzbeschreibung`, `beschreibung` (Markdown), `anmeldungUrl?` (externer Link), `bild?`, `draft`
- **`news`** — `titel`, `datum`, `teaser`, `inhalt` (Markdown), `bild?`, `draft`
- **`projekte`** — `titel`, `zusammenfassung`, `inhalt` (Markdown), `status` (laufend/abgeschlossen), `partner?` (Liste), `bild?`
- **`podcast`** — `titel`, `episodennummer`, `datum`, `embedUrl` (Player-Einbettung), `beschreibung`, `transkript?` (Markdown), `gaeste?`

**Kooperationspartner** und **Sponsoren** als einfache Daten-Collections (`name`, `logo`, `url`, `typ`).

**Statische Seiten** (Zweck, Über uns, Spenden, Kontakt, Impressum, Datenschutz) als Astro-Pages bzw. Markdown – ändern sich selten, Pflege bei Bedarf über Sveltia oder direkt im Repo.

---

## 5. Behandlung der „dynamischen“ Bereiche

Diese drei sind bewusst **nicht** klassisch im CMS gelöst:

**Newsletter** läuft vollständig über einen DSGVO-konformen EU-ESP (Empfehlung: **rapidmail**, deutsch, Server in DE; Alternativen CleverReach oder Brevo). Die Website bindet nur das **Anmeldeformular** (Double-Opt-In) ein und verlinkt das **Archiv** beim ESP. Kein Versand, keine Empfängerverwaltung auf der Website. → *Finale ESP-Wahl noch offen.*

**Material/Downloads** liegen in der **Nextcloud (Hetzner Storage Share)**. Der Verein lädt Dateien per Self-Service hoch; die Seite „Materialien und Veröffentlichungen“ verlinkt öffentliche Shares. Neue Datei = kein Deployment nötig. Optional eine schlanke Download-Collection in Sveltia, die nur Titel + Nextcloud-Link + Kategorie verwaltet.

**Podcast** wird über einen Podcast-Host ausgespielt und per `embedUrl` eingebettet; Episoden-Metadaten und Transkripte in der `podcast`-Collection. → *Host noch offen.*

---

## 6. Designsystem (Mittelweg: Grün/Blau/Weiß + sparsame Akzente)

Leitidee, im Subjekt verankert: Das **Kachel-Raster** der Startseite steht für die verschiedenen **Kooperationsräume** des Vereins – Eingänge, keine Dekoration. Genau ein markantes Element (das Tile-Grid mit dezenter Hover-Interaktion), alles andere ruhig und diszipliniert. Brand-Vorgabe: minimalistisch, freundlich, viel Weißraum, barrierearm.

**Farb-Tokens (Startvorschlag, beim Scaffolding final justieren):**

```css
:root {
  /* Basis */
  --c-blue-900: #1E3A6E;  /* Wortmarke, Headlines */
  --c-blue-600: #2F6FB0;  /* interaktiv, Links */
  --c-green-700: #2E7D57; /* Sekundär, Bestätigung */
  --c-green-500: #3E9B6E; /* Flächen, Akzentgrün */
  /* Neutral */
  --c-ink: #1C2B33;       /* Fließtext */
  --c-muted: #5B6B73;     /* sekundärer Text */
  --c-surface: #F6F8F7;   /* Off-White-Hintergrund */
  --c-white: #FFFFFF;
  /* EIN warmer Akzent – ausschließlich für primäre CTAs */
  --c-accent: #E8833A;
}
```

Die bunte Tile-Palette des Mockups (Orange/Koralle/Limette) wird **nicht** übernommen. Tiles erhalten Grün-/Blau-Abstufungen plus den einen warmen Akzent für die wichtigste Handlung.

**Typografie (open-source, selbst gehostet – DSGVO, kein Google-CDN):**

- **Display/Wortmarke:** *Hanken Grotesk* (charaktervolle, ruhige Grotesk, mit Zurückhaltung einsetzen)
- **Fließtext:** *Atkinson Hyperlegible* (auf Lesbarkeit/Barrierefreiheit optimiert – passt zur Vorgabe „barrierearm“)
- Klare Typo-Skala, bewusste Gewichte, großzügige Zeilenabstände.

**Qualitätsuntergrenze:** responsiv bis Mobile, sichtbarer Tastatur-Fokus, `prefers-reduced-motion` respektiert, WCAG-Kontraste eingehalten.

---

## 7. Mehrsprachigkeit (DE jetzt, EN strukturell vorbereitet)

Astro-i18n mit `de` als Default (ohne Präfix) und `en` als angelegter, aber **noch nicht befüllter** Locale (`/en/...`). Sprachumschalter oben rechts. Collections und Strings so modellieren, dass EN-Übersetzungen später ohne Umbau ergänzt werden können (Sveltia-i18n entsprechend konfigurieren). EN-Inhalte werden in dieser Phase **nicht** geschrieben.

---

## 8. Brand Voice (verbindlich für alle Texte)

Vollständige Vorgaben im „Brand Voice Guide gemeinsam wirkt“. Kernregeln:

- **Du-Ansprache**, durchgängig (Ausnahme: formelle Behördenkontexte).
- Struktur: **Problemvalidierung → Perspektivwechsel → konkrete Handlung.**
- Aktiv statt Passiv, kurze Sätze, Verben statt Nominalstil, konkret statt vage.
- CTAs einladend, nicht drängend („Lass uns sprechen“, nicht „Jetzt zuschlagen!“).
- **Verbotene Begriffe** beachten (u. a. „Win-Win“, „neue Wege gehen“, „nachhaltig“, „Deep Dive“, generische Marketing-Floskeln, Großbuchstaben-Wörter).
- Bevorzugtes Vokabular: Kooperationsraum, Praxislabor, erleben/erproben, geschützter Raum, Prozessbegleitung, Befähigung.

Vorhandene Textbausteine (Zweck, Über uns, Wer wir sind) als Ausgangsmaterial nutzen und Brand-Voice-konform aufbereiten.

---

## 9. Repository-Struktur (Vorschlag)

```
gemeinsam-wirkt-web/
├─ src/
│  ├─ components/        # Tile, Nav, Footer, EventCard, NewsCard …
│  ├─ layouts/           # BaseLayout, PageLayout
│  ├─ pages/             # index.astro + Seitenbaum gem. IA
│  ├─ content/
│  │  ├─ config.ts       # Collections + Zod-Schemata
│  │  ├─ veranstaltungen/ news/ projekte/ podcast/
│  ├─ styles/tokens.css  # Design-Tokens (Abschnitt 6)
│  └─ i18n/              # Locale-Strings (de, en-Gerüst)
├─ public/
│  ├─ admin/             # Sveltia: index.html + config.yml
│  └─ fonts/             # selbst gehostete Schriften
├─ .github/workflows/deploy.yml
├─ astro.config.mjs
├─ CLAUDE.md             # Projektkonventionen (aus diesem Brief)
└─ package.json
```

---

## 10. Deployment (GitHub Actions → Hetzner Webhosting)

Workflow `deploy.yml`, Trigger Push auf `main`:

1. Checkout → `setup-node` → `npm ci`
2. `npm run build` (Astro → `dist/`)
3. `npx pagefind --site dist` (Suchindex erzeugen)
4. Upload `dist/` per SFTP/rsync ins Webhosting-Docroot (z. B. `SFTP-Deploy-Action` oder `lftp`)

Secrets im Repo: `SFTP_HOST`, `SFTP_USER`, `SFTP_PASS` (oder Key), `SFTP_REMOTE_PATH`. Optional `staging`-Branch analog zum reto-Workflow.

**DSGVO-Hinweise:** Schriften selbst hosten (kein Google-CDN-Hotlink), nur EU-Dienste, keine Tracker, cookiefrei per Default (statisch), Newsletter mit DOI + AVV beim ESP, Impressum/Datenschutz vor Livegang vollständig.

---

## 11. Claude-Code-Startprompt (Phase 1)

> Lege ein neues Astro-Projekt `gemeinsam-wirkt-web` an. Ziel: statische, wartungsarme Vereins-Website, DE jetzt, EN strukturell vorbereitet (Astro-i18n, `de` default, `en` als leeres Gerüst).
>
> **Tech:** Astro, Pagefind für Suche, Sveltia CMS unter `public/admin/` (GitHub-Backend), Schriften selbst gehostet. Keine Datenbank, kein Server-Runtime.
>
> **Setze in dieser Phase auf:**
> 1. Projektstruktur gemäß beigefügter `CLAUDE.md`.
> 2. Design-Tokens (`src/styles/tokens.css`) mit den vorgegebenen Grün-/Blau-/Weiß-Werten + einem warmen Akzent. Typografie: Hanken Grotesk (Display), Atkinson Hyperlegible (Body), selbst gehostet.
> 3. `BaseLayout` mit Header-Navigation (gemäß IA aus dem Site Planner) inkl. DE/EN-Umschalter und Footer (mit Newsletter-Anmeldeplatzhalter).
> 4. Startseite als **Kachel-Raster** (Layout-Muster aus dem Home-Dokument, aber Brand-Farben statt Platzhalter), Tiles als Einstiege in die Hauptbereiche, dezente Hover-Interaktion.
> 5. Content Collections `veranstaltungen`, `news`, `projekte`, `podcast` mit Zod-Schemata (Felder siehe Brief) und je 1–2 Beispiel-Einträgen.
> 6. Seitengerüst für alle IA-Knoten; statische Seiten mit Platzhaltertexten in Brand Voice (Du-Ansprache, Problem → Perspektive → Handlung).
> 7. Sveltia-`config.yml` passend zu den Collections, i18n-fähig.
>
> **Qualität:** responsiv bis Mobile, sichtbarer Fokus, `prefers-reduced-motion`, WCAG-Kontraste. Texte streng nach Brand Voice; verbotene Begriffe vermeiden.
>
> Deployment-Workflow und Pagefind-Integration erst nach Abnahme des Gerüsts.

---

## 12. Bewusst zurückgestellt / noch zu entscheiden

- **Spenden:** native Lösung vs. externer EU-Dienst (z. B. betterplace) — vor Befüllung der Spenden-Seite zu klären.
- **Newsletter-ESP:** rapidmail / CleverReach / Brevo — finale Wahl.
- **Podcast-Host:** Anbieter + Einbettungsart.
- **Mitgliederbereich** mit exklusiven Inhalten: kollidiert mit der statischen Architektur → **nach Launch** gesondert lösen (z. B. über Nextcloud), zunächst nicht im Scope.
- **Veranstaltungsanmeldung/Ticketing:** pro Veranstaltung externer Link (`anmeldungUrl`); kein eigenes Buchungssystem in v1.
- **Sveltia-OAuth-Backend:** Cloudflare-Worker einrichten (oder bewusst anders entscheiden).
