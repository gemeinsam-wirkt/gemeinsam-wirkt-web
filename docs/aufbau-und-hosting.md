# Aufbau & Hosting einer statischen Vereins-Website

**Wiederverwendbares Handbuch** für das Setup mit **Astro + Sveltia CMS + GitHub + Hetzner Webhosting**.
Geschrieben am Beispiel `gemeinsam-wirkt.net` — übertragbar auf weitere Projekte.

> Leitidee: Eine **statische** Website, **wartungsarm**, ohne Datenbank und Server-Runtime.
> Redaktion über eine Web-Oberfläche (`/admin`), Technik bleibt unangetastet. „Set and forget“.

---

## Inhalt

1. [Voraussetzungen](#1-voraussetzungen)
2. [Überblick: die Bausteine](#2-überblick-die-bausteine)
3. [Phase A – Projekt lokal aufsetzen (Astro)](#phase-a--projekt-lokal-aufsetzen-astro)
4. [Phase B – Inhaltsmodell & Redaktion (Sveltia)](#phase-b--inhaltsmodell--redaktion-sveltia)
5. [Phase C – Suche (Pagefind)](#phase-c--suche-pagefind)
6. [Phase D – GitHub-Repository](#phase-d--github-repository)
7. [Phase E – Hosting bei Hetzner](#phase-e--hosting-bei-hetzner)
8. [Phase F – OAuth-Login-Vermittler (PHP)](#phase-f--oauth-login-vermittler-php)
9. [Phase G – Automatisches Deployment (GitHub Actions)](#phase-g--automatisches-deployment-github-actions)
10. [Phase H – Go-Live-Checkliste](#phase-h--go-live-checkliste)
11. [Stolpersteine aus der Praxis](#11-stolpersteine-aus-der-praxis-wichtig)

---

## 1. Voraussetzungen

**Konten / Dienste**
- GitHub-Account (idealerweise eine **Organisation**, z. B. `gemeinsam-wirkt`, statt eines persönlichen Accounts).
- Hetzner Webhosting-Paket (z. B. „Webhosting S“), inkl. Domain und Mail.
- Optional: Hetzner Storage Share (Nextcloud) für Datei-Downloads.
- Optional: EU-Newsletter-Dienst (rapidmail / CleverReach / Brevo).

**Lokale Werkzeuge**
- **Node.js ≥ 22.12** und npm.
- **Git**.
- Ein **SFTP-Programm** (WinSCP oder FileZilla) für manuelle Uploads.
- Editor (VS Code o. ä.).

---

## 2. Überblick: die Bausteine

| Schicht | Werkzeug | Aufgabe |
|---|---|---|
| Generator | **Astro** (static) | Baut aus Komponenten + Inhalten fertiges HTML |
| Redaktion | **Sveltia CMS** (`/admin`) | Web-Oberfläche zum Pflegen der Inhalte |
| Login-Vermittler | **PHP-Relay** auf Subdomain | Wickelt nur den GitHub-Login fürs CMS ab |
| Suche | **Pagefind** | Clientseitiger Suchindex, kein Server |
| Versionierung | **GitHub** | Quellcode + Inhalte, Single Source of Truth |
| CI/CD | **GitHub Actions** | Baut bei Push und lädt per SFTP hoch |
| Hosting | **Hetzner Webhosting** | Liefert die statischen Dateien aus |
| Dateien | **Hetzner Storage Share** | Material-Downloads per Self-Service |

Detaillierte, laienverständliche Erklärung des Zusammenspiels: siehe [`architektur-ueberblick.md`](./architektur-ueberblick.md).

---

## Phase A – Projekt lokal aufsetzen (Astro)

1. **Projekt anlegen**
   ```bash
   npm create astro@latest gemeinsam-wirkt-web
   cd gemeinsam-wirkt-web
   ```

2. **Astro-Grundkonfiguration** (`astro.config.mjs`):
   - `site: 'https://DEINE-DOMAIN'` (für Sitemap/Canonical-Links).
   - `output: 'static'` (kein Server-Runtime).
   - i18n: `defaultLocale: 'de'`, `locales: ['de','en']`, `prefixDefaultLocale: false`
     → Deutsch ohne Präfix, Englisch unter `/en/` (strukturell vorbereitet).
   - `trailingSlash: 'never'`, Sitemap-Integration (`npx astro add sitemap`).

3. **Schriften selbst hosten** (DSGVO – kein Google-CDN):
   ```bash
   npm i @fontsource-variable/hanken-grotesk @fontsource/atkinson-hyperlegible
   ```
   In einem globalen Stylesheet importieren. Keine externen Font-Hotlinks.

4. **Design-Tokens** in `src/styles/tokens.css` (Farben, Typo-Skala) zentral definieren.

5. **Layouts & Komponenten**: `BaseLayout`, `PageLayout`, plus wiederverwendbare
   Bausteine (`Header`, `Footer`, `Tile`, `Card`, `EventCard`, `NewsletterForm`,
   `LanguageSwitcher`).

6. **Seitenbaum** unter `src/pages/` gemäß Informationsarchitektur anlegen.

7. **Lokal testen**:
   ```bash
   npm run dev        # http://localhost:4321
   npm run build      # erzeugt dist/
   npm run preview    # baut + zeigt Produktionsstand
   ```

---

## Phase B – Inhaltsmodell & Redaktion (Sveltia)

### B1. Content Collections (Astro)

Datenmodell in `src/content.config.ts` mit **Zod-Schemata** definieren. Beispiel-Collections:

- `veranstaltungen` – Titel, Beginn/Ende, Ort, Kurzbeschreibung, Markdown-Text, Anmelde-Link, Bild, draft
- `news` – Titel, Datum, Teaser, Markdown, Bild, draft
- `projekte` – Titel, Zusammenfassung, Status, Partner-Relation, Markdown, Bild, draft
- `podcast` – Titel, Folgennummer, Datum, Embed-URL, Beschreibung, Gäste, Transkript
- `partner` – Name, Typ, URL, Logo, Beschreibung (als JSON-Daten-Collection)

Pro Collection 1–2 **Beispiel-Einträge** anlegen, damit die Struktur sichtbar ist.

### B2. Sveltia CMS einbinden

1. `public/admin/index.html` – lädt die Sveltia-CMS-Oberfläche.
2. `public/admin/config.yml` – **muss exakt zu den Collections passen** (Feldnamen identisch zu den Zod-Schemata). Kernpunkte:
   ```yaml
   backend:
     name: github
     repo: ORG/REPO
     branch: main
     base_url: https://auth.DEINE-DOMAIN   # ← zeigt auf den OAuth-Vermittler (Phase F)
   media_folder: public/uploads
   public_folder: /uploads
   i18n:
     structure: single_file
     locales: [de, en]
     default_locale: de
   collections:
     - name: veranstaltungen
       # ... Felder identisch zum Schema
   ```

> ⚠️ **`base_url` ist Pflicht**, sobald ein eigener OAuth-Vermittler genutzt wird.
> Fehlt es (oder ist es auskommentiert), fällt Sveltia auf `api.netlify.com/auth`
> zurück → Login schlägt mit „Authentication aborted“ fehl. Siehe Stolpersteine.

---

## Phase C – Suche (Pagefind)

Pagefind indiziert **nach dem Build** die fertigen HTML-Dateien — vollständig clientseitig.

```bash
npm i -D pagefind
```

Skripte in `package.json`:
```json
"search": "pagefind --site dist",
"build:search": "astro build && pagefind --site dist"
```

Eine Suchseite (`/suche`) und ein Suchfeld im Header binden die Pagefind-UI ein.
Der Index (`dist/pagefind/`) entsteht im Build und wird mit deployt — kein Server nötig.

---

## Phase D – GitHub-Repository

1. Repo unter der **Organisation** anlegen (nicht persönlich), z. B. `ORG/gemeinsam-wirkt-web`.
2. Lokales Projekt verknüpfen und pushen:
   ```bash
   git init
   git remote add origin git@github.com:ORG/REPO.git
   git add . && git commit -m "Initiales Astro-Grundgerüst"
   git push -u origin main
   ```
3. `.gitignore` muss `node_modules/`, `dist/`, und **`oauth/config.php`** (das Secret!) ausschließen.

---

## Phase E – Hosting bei Hetzner

Verwaltung über **konsoleH** (Webhosting-Panel). Wichtige Menüpunkte unter **Einstellungen**:

| Menüpunkt | Wofür |
|---|---|
| **Logindaten** | FTP/SFTP-Benutzer & Passwort (Passwort hier neu setzen) |
| **Subdomains** | Subdomain für den OAuth-Vermittler anlegen |
| **DNS-Verwaltung** | A-/AAAA-Records, falls nicht automatisch gesetzt |
| **SSL Manager** | Let's-Encrypt-Zertifikat aktivieren |

### E1. Domain & Webroot
- Die Domain wird aus **`/public_html`** ausgeliefert (das ist das Webroot).
- Das SFTP-„Startverzeichnis: /“ ist nur das FTP-Home, **nicht** das Webroot.

### E2. SSL
- Im **SSL Manager** Let's Encrypt für Domain **und** Subdomains aktivieren.
- Ein Wildcard-Zertifikat `*.DEINE-DOMAIN` deckt auch die `auth.`-Subdomain ab.
- **Achtung:** Die Aktivierung kann einen im Panel **nicht offensichtlichen Schritt**
  erfordern (Zertifikat muss explizit „zugewiesen“/aktiviert werden, nicht nur
  ausgestellt). Greift HTTPS nicht, zeigt der Server das Default-Zert `*.your-server.de`.

### E3. SFTP-Zugang testen
- Host: `wXXX.your-server.de`, Port `22`, Protokoll **SFTP**.
- Benutzer/Passwort aus **Logindaten**.

---

## Phase F – OAuth-Login-Vermittler (PHP)

Sveltia braucht für den GitHub-Login einen serverseitigen Tausch „Code → Token“ mit
einem geheimen Client-Secret. Das Secret darf **nicht** in den Browser → ein winziges
PHP-Relay übernimmt das. (Alternative: Cloudflare-Worker `sveltia-cms-auth`.)

### F1. GitHub-OAuth-App anlegen
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
(unter der Organisation):
- **Homepage URL:** `https://DEINE-DOMAIN`
- **Authorization callback URL:** `https://auth.DEINE-DOMAIN/callback` *(exakt!)*
- Client-ID notieren, Client-Secret generieren (wird nur einmal angezeigt).

### F2. Subdomain für den Vermittler
- In konsoleH **Subdomain** `auth.DEINE-DOMAIN` anlegen.
- Zielverzeichnis: `/public_html/auth` (das Panel erlaubt nur Pfade **unter** `public_html`).
- **PHP** für die Subdomain aktivieren (8.x).

### F3. Relay-Dateien hochladen
Per SFTP in `/public_html/auth`:
- `index.php` (der Vermittler: `/auth` → GitHub, `/callback` → Token-Tausch)
- `.htaccess` (leitet alle Pfade auf `index.php`, sperrt `config.php`)
- `config.php` (aus `config.sample.php` erzeugt, mit **echter** Client-ID + Secret) — **nur auf dem Server, nie ins Git**

### F4. Testen
- `https://auth.DEINE-DOMAIN/auth` → leitet zu GitHub weiter.
- `https://auth.DEINE-DOMAIN/config.php` → **403 Forbidden** (Secret geschützt).

Vollständige Anleitung: [`../oauth/README.md`](../oauth/README.md).

---

## Phase G – Automatisches Deployment (GitHub Actions)

Workflow `.github/workflows/deploy.yml`, Trigger: Push auf `main`.

**Ablauf:** Checkout → Node → `npm ci` → `npm run build` → `pagefind --site dist`
→ Upload `dist/` per `lftp mirror` nach `/public_html`.

```yaml
mirror --reverse --delete --verbose --parallel=4 \
  --exclude-glob .git*/ \
  --exclude-glob auth/ \        # ← schützt den OAuth-Ordner vor dem Löschen!
  dist/ '${SFTP_REMOTE_PATH}'
```

**Repo-Secrets** (Settings → Secrets and variables → Actions):
`SFTP_HOST`, `SFTP_USER`, `SFTP_PASS`, `SFTP_REMOTE_PATH` (= `/public_html`).

> ⚠️ `mirror --delete` macht das Zielverzeichnis **exakt** gleich dem Build —
> alles, was nicht im Build ist, wird auf dem Server **gelöscht**. Deshalb muss
> der OAuth-Ordner (`auth/`) ausgenommen werden, sonst verschwindet er samt Secret.

---

## Phase H – Go-Live-Checkliste

- [ ] `astro.config.mjs` → richtige `site`-Domain.
- [ ] Schriften selbst gehostet, keine externen CDN-Hotlinks.
- [ ] Impressum + Datenschutzerklärung vollständig.
- [ ] Cookiefrei / keine Tracker (statisch = Default).
- [ ] SSL aktiv für Domain **und** `auth.`-Subdomain (HTTPS ohne Warnung).
- [ ] OAuth-App-Callback exakt `https://auth.DEINE-DOMAIN/callback`.
- [ ] `config.yml` auf dem Server hat **aktives** `base_url`.
- [ ] `deploy.yml` enthält `--exclude-glob auth/`.
- [ ] `/admin`-Login getestet (GitHub-Popup läuft durch, Collections erscheinen).
- [ ] Newsletter-Formular mit Double-Opt-In beim ESP, AVV abgeschlossen.

---

## 11. Stolpersteine aus der Praxis (wichtig!)

Diese Punkte haben beim ersten Aufbau echte Zeit gekostet — beim nächsten Mal direkt beachten:

1. **Webroot ist `/public_html`, nicht `/`.**
   Deployt man mit `mirror --delete` nach `/`, löscht es Hetzner-Systemdateien
   (`.bashrc`, `www_logs`) und `public_html` selbst. Zielpfad immer `/public_html`.

2. **OAuth-Ordner liegt *im* Webroot und muss vom Deploy ausgenommen werden.**
   Das Hetzner-Panel lässt Subdomains nur unter `/public_html` anlegen. Ohne
   `--exclude-glob auth/` löscht der nächste Deploy den Ordner (inkl. `config.php`).

3. **SFTP-Upload landet leicht im falschen Ordner.**
   Beim manuellen Upload prüfen, dass die **Server-Pfadzeile** wirklich auf
   `/public_html/auth` steht — nicht auf `/public_html`. Sonst überschreibt die
   OAuth-`.htaccess` (`DirectoryIndex index.php`) die Startseite und leitet alles
   zu GitHub um.

4. **`config.yml` ohne aktives `base_url` → Login scheitert.**
   Symptom: Popup geht an `api.netlify.com/auth` → „Not Found“ → „Authentication
   aborted“. Lösung: `base_url: https://auth.DEINE-DOMAIN` aktiv setzen **und
   deployen** (eine veraltete `config.yml` auf dem Server reicht zum Scheitern).

5. **SSL braucht ggf. einen versteckten Aktivierungsschritt.**
   Zertifikat „ausgestellt“ heißt nicht automatisch „ausgeliefert“. Im SSL Manager
   prüfen, dass es der Domain/Subdomain **zugewiesen** ist.

6. **GitHub-Secrets sind nicht auslesbar.**
   `SFTP_PASS` & Co. kann man nur überschreiben, nicht ansehen. Passwort separat
   sicher notieren. Wird das FTP-Passwort neu gesetzt, **beide** Stellen nachziehen
   (WinSCP + GitHub-Secret).

7. **Manuelle Server-Änderungen sind nur Stopgaps.**
   Was man per SFTP direkt hochlädt, wird beim nächsten Deploy überschrieben (außer
   in ausgenommenen Ordnern). Dauerhafte Änderungen gehören ins Repo → `main` → Deploy.
