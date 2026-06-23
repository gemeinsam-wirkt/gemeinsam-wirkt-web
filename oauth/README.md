# OAuth-Vermittler für den CMS-Login (`/admin`)

Kleiner PHP-Dienst, der **nur den GitHub-Login** für Sveltia CMS abwickelt –
keine Inhalte. Läuft auf einer eigenen Subdomain im Hetzner-Webhosting,
**getrennt** vom Astro-Deploy.

> **Hinweis zum Ablageort:** Das Hetzner-Webhosting-Panel legt Subdomains nur
> *innerhalb* von `/public_html` an, ein Verzeichnis darüber ist nicht wählbar.
> Der Vermittler liegt deshalb unter `/public_html/auth`. Damit der
> `mirror --delete`-Deploy ihn nicht löscht, ist `auth/` in
> `.github/workflows/deploy.yml` per `--exclude-glob auth/` ausgenommen.

> Warum überhaupt nötig? GitHub-OAuth verlangt einen serverseitigen Tausch
> „Code → Token“ mit einem geheimen Client-Secret. Das Secret darf nicht in den
> Browser, also braucht es diesen winzigen Mittler. (Entfällt evtl. künftig,
> sobald GitHub PKCE für OAuth-Apps unterstützt.)

## Dateien

| Datei | Zweck |
|---|---|
| `index.php` | Der eigentliche Vermittler (auth + callback). |
| `.htaccess` | Leitet `/auth` und `/callback` auf `index.php`, sperrt `config.php`. |
| `config.sample.php` | Vorlage – auf dem Server zu `config.php` kopieren. |
| `config.php` | **Nur auf dem Server**, enthält das Secret, nicht im Git. |

---

## Einrichtung (einmalig)

### 1. GitHub-OAuth-App anlegen

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
(idealerweise unter der Organisation `gemeinsam-wirkt`, damit der Zugriff aufs
Repo organisationsweit gilt):

- **Application name:** `gemeinsam wirkt CMS`
- **Homepage URL:** `https://gemeinsam-wirkt.net`
- **Authorization callback URL:** `https://auth.gemeinsam-wirkt.net/callback`

Danach **Client-ID** notieren und **„Generate a new client secret“** klicken,
Secret kopieren (wird nur einmal angezeigt).

### 2. Subdomain in konsoleH einrichten

1. Hetzner-Webhosting-Panel → **Neue Subdomain:** `auth.gemeinsam-wirkt.net`.
2. Als **Zielverzeichnis** `/public_html/auth` (das Panel erlaubt nur Pfade
   unter `/public_html`). Der Ordner ist im Deploy per `--exclude-glob auth/`
   vor dem `--delete` geschützt, bleibt also unberührt. „www anlegen“ kann aus.
3. Für diese Subdomain **PHP aktivieren** (aktuelle Version, z. B. PHP 8.x).
4. DNS prüfen: Falls nicht automatisch angelegt, A-Record
   `auth` → `167.235.121.72` und AAAA → `2a01:4f8:1061:217b::2` setzen.

### 3. Dateien hochladen

In das Subdomain-Verzeichnis (`/auth`) hochladen:

- `index.php`
- `.htaccess`

Dann `config.sample.php` als **`config.php`** dorthin kopieren und Client-ID +
Secret aus Schritt 1 eintragen. `config.sample.php` selbst muss nicht hochgeladen
werden.

### 4. SSL für die Subdomain

In konsoleH **Let's Encrypt** auch für `auth.gemeinsam-wirkt.net` aktivieren.
Das vorhandene Wildcard-Zertifikat `*.gemeinsam-wirkt.net` deckt diese Subdomain
bereits ab, sobald es sauber greift.

### 5. CMS-Konfiguration

In `public/admin/config.yml` ist `base_url: https://auth.gemeinsam-wirkt.net`
bereits gesetzt. Nach dem nächsten Deploy zeigt das CMS automatisch auf den
Vermittler.

---

## Test

1. `https://gemeinsam-wirkt.net/admin/` öffnen.
2. **„Mit GitHub anmelden“** → Popup → GitHub-Freigabe.
3. Popup schließt sich, das CMS ist eingeloggt und zeigt die Collections.

**Fehlersuche**

- *Popup zeigt „config.php fehlt“* → `config.php` wurde nicht angelegt.
- *„Ungültiger state-Parameter“* → Cookies im Browser blockiert, oder Aufruf
  nicht über HTTPS.
- *Login-Popup bleibt hängen* → Callback-URL in der GitHub-App stimmt nicht
  exakt mit `https://auth.gemeinsam-wirkt.net/callback` überein.
- *404 auf `/auth` oder `/callback`* → `.htaccess`/FallbackResource greift nicht;
  in `.htaccess` die mod_rewrite-Variante aktivieren (unten auskommentiert).
