# Webmaster-Übergabe · gemeinsam wirkt e.V.

Diese Datei ist die zentrale Betriebsdoku für die Person, die die **volle
Verantwortung für die Website** übernimmt. Sie bündelt alle Zugänge, den
Deploy-Weg, die Stolpersteine und den Arbeitsablauf an einer Stelle.

> **Achtung – dieses Repo ist öffentlich.** In dieser Datei stehen bewusst
> **keine Passwörter, Secrets oder IBANs** – nur *wo* sie liegen. Die echten
> Zugangsdaten liest du über deine GitHub- und Hetzner-Zugänge selbst aus.
> Trage hier niemals Secrets ein.

Verbindliche inhaltliche/gestalterische Konventionen stehen in
[`CLAUDE.md`](./CLAUDE.md), die Kurz-Bedienung in [`README.md`](./README.md),
der CMS-Login-Vermittler in [`oauth/README.md`](./oauth/README.md).

---

## 1. Was die Website technisch ist (in fünf Sätzen)

- Eine **statische** Website, gebaut mit **Astro** (kein Server, keine Datenbank).
- Inhalte werden über **Sveltia CMS** unter `/admin` gepflegt; jede Speicherung
  ist ein **Git-Commit** ins Repo `gemeinsam-wirkt/gemeinsam-wirkt-web`.
- Jeder **Push auf `main`** startet automatisch **GitHub Actions**, baut die Seite
  und lädt sie per SFTP auf das **Hetzner-Webhosting** → nach ~1 Minute live.
- Der CMS-Login läuft über einen kleinen **PHP-OAuth-Vermittler** auf der
  Subdomain `auth.gemeinsam-wirkt.net` (nur der Login, nicht die Inhalte).
- Live unter **https://gemeinsam-wirkt.net**.

---

## 2. Zugänge (das musst du besitzen)

Ohne diese fünf Zugänge ist die Verantwortung nicht vollständig übertragbar.
Die eigentlichen Zugangsdaten liegen **im jeweiligen Werkzeug**, nicht hier.

| # | Zugang | Steuert | Wo die Zugangsdaten liegen |
|---|---|---|---|
| 1 | **GitHub-Org `gemeinsam-wirkt`** (als *Organization Owner*) | Quellcode, Inhalte, Deploy-Automatik, Deploy-Secrets | github.com – eigenes Konto als Owner |
| 2 | **GitHub-Vereinskonto `gemeinsamwirkt`** | Besitzt die OAuth-App fürs CMS (s. #4) | Login des Vereinskontos |
| 3 | **Hetzner-Account (konsoleH)** | Webhosting/`public_html`, SSL, Subdomains, Mail, DNS | Hetzner-Login des Vereins |
| 4 | **GitHub-OAuth-App „gemeinsam wirkt CMS"** | CMS-Login (`/admin`) | Client-ID im GitHub-Konto; Secret nur in `config.php` auf dem Server |
| 5 | **Domain `gemeinsam-wirkt.net` + Nextcloud** | Domain (bei Hetzner), Material-Dateien (Storage Share) | Hetzner / Nextcloud-Login |

**Deploy-Secrets** (GitHub → Repo → *Settings → Secrets and variables →
Actions*): `SFTP_HOST`, `SFTP_USER`, `SFTP_PASS`, `SFTP_REMOTE_PATH`.
`SFTP_REMOTE_PATH` muss `/public_html` sein (siehe Stolperstein unten).

---

## 3. So arbeitest du an Code/Entwurf

Du brauchst Git nicht selbst zu beherrschen – **Claude Code** übernimmt
`clone`, `commit`, `push` für dich. Zwei Wege:

### Weg A (empfohlen): Claude Code aus der Cloud – kein lokales Setup

Voraussetzung: ein **eigener Claude-Account mit Pro-, Max- oder Team-Plan**
(Claude Code im Web ist derzeit für diese Pläne verfügbar) und dein
**GitHub-Zugang** als Org-Owner. Kein Node, kein Git, keine Installation.
Offizielle Anleitung: <https://code.claude.com/docs/en/web-quickstart>.

**Einmalig – GitHub verbinden:**

1. **claude.ai/code** öffnen und mit dem eigenen Anthropic-Konto anmelden.
2. Dem Prompt folgen, die **Claude-GitHub-App installieren** und ihr Zugriff
   geben: Organisation **`gemeinsam-wirkt`** wählen und (gezielt) das Repo
   **`gemeinsam-wirkt-web`** freigeben. Als Org-Owner bestätigst du das selbst.
3. Zur **Cloud-Umgebung**: Defaults lassen (Netzzugang „Trusted" reicht für den
   npm-Build) → **Create environment**. Node 22 ist in der Cloud-VM vorhanden.

> Hinweis: Eine Session sieht jedes Repo, das dein GitHub-Konto sehen kann – die
> App-Installation steuert v. a. die Auto-fix-Webhooks, nicht den Zugriff.

**Pro Änderung:**

4. Repo **`gemeinsam-wirkt/gemeinsam-wirkt-web`** und Branch (`main`) wählen.
5. Modus wählen – **„Plan mode"** (Claude schlägt erst vor) ist am Anfang
   konservativer als „Accept edits".
6. Aufgabe **konkret** beschreiben (Datei/Funktion nennen). Claude klont das
   Repo (dabei wird `CLAUDE.md` automatisch geladen → Brand Voice/Design greifen
   von selbst), arbeitet und **pusht einen Branch**.
7. **Diff** prüfen, ggf. Inline-Kommentare, dann **„Create PR"** → auf GitHub
   **mergen**. Der Merge auf `main` löst den Deploy aus (~1 Min. bis live).

### Weg B: lokal auf dem eigenen Rechner

Voraussetzung: **Git** + **Node.js ≥ 22.12** installiert.

```bash
git clone https://github.com/gemeinsam-wirkt/gemeinsam-wirkt-web.git
cd gemeinsam-wirkt-web
npm install
npm run dev        # → http://localhost:4321
```

Ablauf für eine Änderung:

```bash
git checkout main && git pull
git checkout -b kurzer-branch-name
# … ändern; im Browser auf localhost:4321 prüfen …
npx astro check                 # Typprüfung (empfohlen)
git add -A && git commit -m "beschreibt die Änderung"
git push -u origin kurzer-branch-name
```

> **`main` = live.** Ein Push auf `main` veröffentlicht sofort. Als alleinige/r
> Verantwortliche/r darfst du das – wenn du ein Sicherheitsnetz willst, arbeite
> über einen Branch + Pull Request und merge erst nach einer letzten Prüfung.

Nützliche Befehle: `npm run dev` (Vorschau), `npm run build` (Produktions-Build
nach `dist/`), `npm run preview` (Build ansehen), `npx astro check` (Typprüfung).

---

## 4. Inhalte pflegen (ohne Code)

- Über **https://gemeinsam-wirkt.net/admin** (Sveltia CMS, Login mit GitHub).
- Pflegbare Sammlungen: Veranstaltungen, News, Projekte, Podcast, Vorstand,
  Partner & Sponsoren, Materialien & Veröffentlichungen.
- Statische Seiten (Zweck, Über uns, Spenden, Kontakt, Impressum, Datenschutz)
  liegen als `.astro`-Dateien unter `src/pages/` – ändern sich selten.
- `draft: true` blendet einen Eintrag vom Build aus.
- Bilder: nur **JPG, PNG, WebP, GIF, AVIF, SVG** – **kein `.jfif`** (wird sonst
  nicht angezeigt).
- **Dateinamen ohne Umlaute, Leerzeichen und Sonderzeichen** – nur `a–z`,
  `0–9`, `-` und `_`, also `portraet-robert-bautzmann.jpg` statt
  `2J3A7039_PorträtRB.jpg`. Solche Namen laufen unverändert durch Git, den
  SFTP-Upload und die URL. Ein Umlaut kann auf einer dieser Stationen kippen –
  dann baut die Seite sauber, das Bild zeigt live aber ins Leere.
- **Zwei Wege, ein Bild hochzuladen** – beide bauen, aber sie sind nicht gleich:
  - über das **Bild-Feld des Beitrags**: die Datei landet neben dem Text, Astro
    optimiert sie (WebP, passende Größen). **Das ist der bevorzugte Weg.**
  - über die **globale Medienbibliothek**: die Datei landet in `public/uploads`
    und wird unverändert ausgeliefert – funktioniert, ist aber größer und
    langsamer.

---

## 5. Deploy & Infrastruktur im Detail

- **Workflow:** `.github/workflows/deploy.yml`, Trigger Push auf `main` (oder
  manuell über den *Actions*-Tab). Schritte: Build → Pagefind-Suchindex →
  `lftp mirror --reverse --delete` per SFTP.
- **Zielpfad:** immer **`/public_html`** (das Webroot der Domain).
- **OAuth-Vermittler** liegt unter `/public_html/auth` und ist im Deploy per
  `--exclude-glob auth/` vom Löschen ausgenommen – niemals entfernen.
- **SSL:** Let's-Encrypt-Wildcard `*.gemeinsam-wirkt.net` in konsoleH (deckt auch
  `auth.` ab). Einrichtung des Relays Schritt für Schritt in
  [`oauth/README.md`](./oauth/README.md).
- **OAuth-Callback-URL** (muss exakt in der GitHub-App stehen):
  `https://auth.gemeinsam-wirkt.net/callback`. Homepage-URL:
  `https://gemeinsam-wirkt.net`. Das Secret steht ausschließlich in
  `/public_html/auth/config.php` auf dem Server (nicht im Repo).

---

## 6. SEO & Auffindbarkeit

Die technische SEO-Grundlage ist eingerichtet – sie läuft „set and forget" und
braucht im Alltag keine Pflege. Was schon steckt:

- **Sitemap** (`@astrojs/sitemap` in `astro.config.mjs`) → `sitemap-index.xml`,
  automatisch bei jedem Build. **`public/robots.txt`** erlaubt Crawling und
  verweist auf die Sitemap.
- **Canonical-URLs**, saubere URL-Struktur (kein trailing slash) und das
  `lang`-Attribut – zentral in `src/layouts/BaseLayout.astro`.
- **Teilen-Vorschau (Open Graph / Twitter Cards):** Titel, Beschreibung und ein
  gebrandetes Vorschaubild (`public/og-default.png`, 1200×630) für hübsche
  Link-Vorschauen in WhatsApp/LinkedIn/Facebook/X. Pro Seite überschreibbar via
  `image="/pfad.png"` an das Layout.
- **Strukturierte Daten (JSON-LD, schema.org)** über `src/components/JsonLd.astro`:
  - **Organization + WebSite** auf der Startseite (Basis fürs Google Knowledge Panel).
  - **Event** auf jeder Veranstaltungs-Detailseite (Termine können als Rich Result
    in der Google-Suche erscheinen).
  - **NewsArticle** auf jeder News-Detailseite.
  - Die Vereinsstammdaten dafür liegen zentral in **`src/data/site.ts`**
    (Name, Adresse, E-Mail, Logo `public/logo.png`). Ändern sich diese, **nur dort**
    anpassen.
- **Schriften selbst gehostet** (kein Google-CDN) – gut für DSGVO *und* Ladezeit.

**Was die Redaktion tun kann (optional, kein Muss):**

- Aussagekräftige **Titel** und **Teaser/Kurzbeschreibungen** pflegen – sie werden
  direkt als Suchergebnis-Text und Teilen-Beschreibung genutzt.
- Beiträgen ein **Bild** geben – es wird automatisch zum Teilen-Vorschaubild.

**Nach dem nächsten Deploy einmalig prüfen** (rein zur Kontrolle):

- **Rich Results Test** (search.google.com/test/rich-results) mit einer News- und
  einer Veranstaltungs-URL.
- **Schema Markup Validator** (validator.schema.org) mit der Startseite.

Die Vorschaubilder `og-default.png` und `logo.png` liegen als fertige Dateien in
`public/`. Bei einem Rebranding neu erzeugen lassen (Markenfarben aus
`src/styles/tokens.css`) und ersetzen.

### Google Search Console (einmalig einrichten)

Meldet die Website bei Google an, reicht die Sitemap ein und zeigt
Indexierungs-/Fehlerberichte. Voraussetzung: ein **Google-Konto** – idealerweise
ein **Vereinskonto** (übergebbar), nicht das private.

1. **Property anlegen:** search.google.com/search-console → „Property hinzufügen"
   → Typ **„Domain"** (nicht „URL-Präfix") → `gemeinsam-wirkt.net` eingeben.
   Google zeigt einen **TXT-Wert** (`google-site-verification=…`) an.
2. **Per DNS bestätigen** – in **Hetzner konsoleH** → Domain → *DNS-Einstellungen*
   einen **TXT-Record** anlegen: Name/Host `@` (Root), Typ `TXT`, Wert = der
   komplette `google-site-verification=…`-String. Speichern, kurz warten, dann in
   der Search Console **„Bestätigen"**.
3. **Sitemap einreichen:** links „Sitemaps" → `sitemap-index.xml` senden
   (Achtung: **-index**, nicht nur `sitemap.xml`).
4. Optional: Startseite über die **URL-Prüfung** zur Indexierung einreichen;
   weitere Personen unter *Einstellungen → Nutzer und Berechtigungen* hinzufügen.

> **Nicht die HTML-Datei-Methode nutzen.** Der Deploy räumt `public_html` per
> `mirror --delete` auf – eine hochgeladene `googleXXXX.html` würde beim nächsten
> Push gelöscht. Die DNS-Bestätigung ist davon unabhängig und bleibt bestehen.

---

## 7. Stolpersteine (aus der bisherigen Praxis)

- **Deploy-Ziel niemals `/`**, immer `/public_html`. Mit `mirror --delete` nach
  `/` löscht man Hetzner-Systemdateien (`.bashrc`, `www_logs`) und das
  `public_html`-Verzeichnis selbst.
- **`auth/` nie mitlöschen.** Der `--exclude-glob auth/` in `deploy.yml` schützt
  das OAuth-Relay samt `config.php`-Secret. Beim Umbau des Workflows beibehalten.
- **CMS committet direkt auf `main`.** Wenn jemand parallel im CMS speichert,
  während du lokal arbeitest, ist dein `main` veraltet → **vor dem Weiterarbeiten
  immer `git fetch` + rebase/pull.**
- **Bildpfade brechen den Build nicht mehr.** Früher stoppte ein Bild aus der
  globalen Medienbibliothek (`/uploads/…`) den Build mit `[ImageNotFound]`, weil
  Astros `image()`-Helfer nur Dateien auflösen kann, die neben dem Text liegen.
  Seit Commit `959658d` nimmt das `bild`-Feld beide Pfadformen an;
  `src/components/ContentImage.astro` entscheidet beim Rendern. Ein vertippter
  Bildpfad führt jetzt zu einem fehlenden Bild statt zu einem fehlgeschlagenen
  Deploy.
- **Gelöschte CMS-Einträge bauen weiter?** Astro-Cache leeren:
  `rm -rf .astro dist node_modules/.astro`, dann neu bauen.
- **Nextcloud (Storage Share) erzwingt Passwortschutz** für öffentliche Links.
  Für Videos daher lieber YouTube „nicht gelistet"; für Nextcloud-Dateien das
  erzwungene Share-Passwort ins Feld `passwort` – wird öffentlich angezeigt, also
  nur für ohnehin öffentliche Dateien.

---

## 8. Geparkt / noch offen

- **Podcast-Host = Letscast.fm** entschieden, Account erst bei der ersten Folge
  anlegen (kostet nach Probephase). Pro Folge nur `embedUrl` in der
  `podcast`-Collection setzen.
- **Online-Spende:** Kandidat **goodcrowd.org** (betterplace scheidet aus – setzt
  Gemeinnützigkeit voraus, die der Verein nicht hat). Vorbereiteter Block in
  `spenden.astro` – zum Aktivieren Kampagne anlegen, `GOODCROWD_URL` setzen,
  Block einkommentieren. Bankverbindung ist bereits live.
- **Datenschutzerklärung** vor breitem Livegang **juristisch prüfen** lassen
  (Verantwortlichen-Angaben korrekt, Text materiell noch Gerüst).
- **Newsletter** läuft per `mailto` an `newsletter@gemeinsam-wirkt.net` (kein
  ESP) – dokumentierte Einwilligung, Verein bestätigt per Antwort.
- **Englisch** ist strukturell vorbereitet (`/en/`), aber noch nicht befüllt.
- **Social-Profile fürs Knowledge Panel:** In `src/data/site.ts` ist das Feld
  `sameAs` noch leer. Sobald der Verein öffentliche Profile hat (LinkedIn,
  Instagram, YouTube …), dort die URLs eintragen – das stärkt die Verknüpfung
  fürs Google Knowledge Panel spürbar.

---

## 9. Konventionen (verbindlich)

- **Brand Voice:** Du-Ansprache, Struktur Problem → Perspektive → Handlung;
  verbotene Begriffe (u. a. „nachhaltig", „Win-Win", „neue Wege gehen") meiden.
  Details in [`CLAUDE.md`](./CLAUDE.md) §8.
- **Design:** nur die Tokens aus `src/styles/tokens.css` verwenden, keine neuen
  Farben erfinden. Schriften selbst gehostet (kein Google-CDN).
- **Barrierefreiheit:** sichtbarer Tastatur-Fokus, WCAG-Kontraste,
  `prefers-reduced-motion` respektieren.
- **DSGVO:** nur EU-Dienste, keine Tracker, cookiefrei.
```
