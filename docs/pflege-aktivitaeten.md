# Aktivitätenliste Website-Pflege

Wer macht **was**, **wann**, **wo** und **wie**. Aufbauend auf dem
[Architektur-Überblick](./architektur-ueberblick.md).

---

## Rollen

| Rolle | Wer | Kann / darf |
|---|---|---|
| **Redaktion** | Vorstand / Geschäftsstelle (mehrere Personen) | Inhalte über `/admin` pflegen: Veranstaltungen, News, Projekte, Podcast, Partner |
| **Technischer Vorstand** | 1–2 technisch versierte Personen | Code, Design, Struktur, Deployment, Hosting, Zertifikate, Secrets |
| **Datei-Pflege** | beliebiges Vorstandsmitglied | Material in den Storage Share laden, Links pflegen |
| **Newsletter** | benannte Person | Versand & Empfänger beim externen Dienst (ESP) |

> Grundprinzip: **Redaktion ist von Technik entkoppelt.** Inhalte hängen nicht an einer
> einzelnen Person. Die Technik bleibt beim technischen Vorstand.

---

## Zugänge – wer braucht was

| Zugang | Wofür | Wer braucht ihn |
|---|---|---|
| **GitHub-Account** (Mitglied der Org `gemeinsam-wirkt`) | Login ins CMS `/admin` | Jede:r aus der Redaktion |
| **konsoleH (Hetzner)** | Hosting, SSL, Subdomains, FTP | Nur technischer Vorstand |
| **SFTP-Zugang** (WinSCP) | manuelle Server-Uploads | Nur technischer Vorstand |
| **Storage Share (Nextcloud)** | Material hochladen | Datei-Pflege |
| **Newsletter-Dienst** | Versand | Newsletter-Verantwortliche:r |

---

## A. Laufende Redaktion (über `/admin`)

**Wo:** `https://gemeinsam-wirkt.net/admin/` · **Wie:** Mit GitHub anmelden, Formular ausfüllen, speichern.
Nach dem Speichern ist die Änderung in **1–2 Minuten** automatisch live.

| Was | Wer | Wann | Wie (Kurz) |
|---|---|---|---|
| **Veranstaltung anlegen/ändern** | Redaktion | bei Bedarf, vor dem Termin | `/admin` → „Veranstaltungen“ → Eintrag → Felder ausfüllen → Veröffentlichen |
| **News-Beitrag schreiben** | Redaktion | bei Neuigkeiten | `/admin` → „News“ → Neuer Beitrag |
| **Projekt pflegen** | Redaktion | bei Projektstart/-ende | `/admin` → „Projekte“ → Status auf laufend/abgeschlossen setzen |
| **Podcast-Folge eintragen** | Redaktion | je neue Folge | `/admin` → „Podcast“ → Embed-URL + Beschreibung + ggf. Transkript |
| **Partner/Sponsor ergänzen** | Redaktion | bei neuer Kooperation | `/admin` → „Partner & Sponsoren“ → Name, Typ, Logo, Link |
| **Entwurf zurückhalten** | Redaktion | wenn noch nicht öffentlich | Feld **„Entwurf“** anhaken → erscheint nicht auf der Website |

> 💡 **Bilder:** direkt im Formular hochladen. **Inhalte versehentlich gelöscht?** Kein
> Drama — der technische Vorstand kann über GitHub jeden früheren Stand wiederherstellen.

---

## B. Material & Downloads (Storage Share)

**Wo:** Hetzner Storage Share (Nextcloud) · **Wie:** Datei hochladen, öffentlichen Link erzeugen.

| Was | Wer | Wann | Wie |
|---|---|---|---|
| **Material hochladen** | Datei-Pflege | bei neuem Dokument | In Nextcloud hochladen → „Teilen“ → öffentlichen Link kopieren |
| **Link auf der Website ergänzen** | Redaktion | nach Upload | Auf der Materialien-Seite den Link eintragen (über `/admin` bzw. Repo) |
| **Veraltetes Material entfernen** | Datei-Pflege | jährlich prüfen | In Nextcloud löschen + Link auf der Seite entfernen |

> Vorteil: Neue Dateien brauchen **kein** Website-Deployment.

---

## C. Newsletter (externer Dienst)

**Wo:** Beim ESP (rapidmail o. ä.) · **Wie:** Im Dienst-Portal, nicht auf der Website.

| Was | Wer | Wann | Wie |
|---|---|---|---|
| **Newsletter erstellen & versenden** | Newsletter-Verantwortliche:r | nach Redaktionsplan | Im ESP-Portal |
| **Anmeldeformular prüfen** | Newsletter-Verantwortliche:r | quartalsweise | Test-Anmeldung über das Formular im Footer (Double-Opt-In) |
| **Abmeldungen / DSGVO** | Newsletter-Verantwortliche:r | laufend | Übernimmt der ESP automatisch |

---

## D. Technische Pflege (technischer Vorstand)

**Wo:** GitHub / konsoleH / lokal · **Wie:** Code-Änderung → `main` → automatischer Deploy.

| Was | Wann | Wie |
|---|---|---|
| **Design/Struktur ändern, neue Seitentypen** | bei Bedarf | Lokal entwickeln → Branch → Pull Request → Merge nach `main` → Deploy läuft automatisch |
| **Abhängigkeiten aktualisieren** | ~halbjährlich | `npm update` lokal, testen (`npm run build`), committen |
| **Deploy überwachen** | bei jedem Push auf `main` | GitHub → Reiter **Actions** → grüner Haken = erfolgreich |
| **SSL-Zertifikat prüfen** | jährlich (Let's Encrypt erneuert automatisch) | konsoleH → **SSL Manager**; im Browser auf Schloss-Symbol achten |
| **OAuth-`config.php` / Secrets** | nur bei Wechsel | Secret rotieren in GitHub-OAuth-App **und** `config.php` auf dem Server |
| **FTP-Passwort wechseln** | bei Bedarf | konsoleH → **Logindaten**; danach **WinSCP** und GitHub-Secret `SFTP_PASS` nachziehen |

> ⚠️ **Nie** das geheime `oauth/config.php` ins Git committen. **Nie** den `auth/`-Ordner
> auf dem Server löschen — er ist absichtlich vom Deploy ausgenommen.

---

## E. Regelmäßige Kontrollen (Routine-Kalender)

| Intervall | Aufgabe | Wer |
|---|---|---|
| **Laufend** | Inhalte aktuell halten (Termine, News) | Redaktion |
| **Monatlich** | Website kurz durchklicken: Links, Bilder, Termine korrekt? | Redaktion |
| **Quartalsweise** | Newsletter-Anmeldung testen; Impressum/Datenschutz aktuell? | Newsletter / techn. Vorstand |
| **Halbjährlich** | `npm update` + Test-Build; Material-Links prüfen | techn. Vorstand / Datei-Pflege |
| **Jährlich** | SSL & Domain-Laufzeit prüfen; verwaiste Inhalte/Dateien aufräumen | techn. Vorstand |
| **Nach jedem Push auf `main`** | Deploy-Status in GitHub Actions kontrollieren | techn. Vorstand |

---

## F. Was tun, wenn …? (Schnellhilfe)

| Problem | Erste Maßnahme | Zuständig |
|---|---|---|
| **`/admin`-Login geht nicht** | HTTPS-Schloss da? Popup erlaubt? Sonst: `base_url` in `config.yml` & OAuth-Callback prüfen | techn. Vorstand |
| **Änderung erscheint nicht** | 1–2 Min warten; GitHub → Actions auf Fehler prüfen | techn. Vorstand |
| **„Authentication aborted“ beim Login** | Deployte `config.yml` hat aktives `base_url`? (siehe Stolpersteine) | techn. Vorstand |
| **Zertifikatswarnung im Browser** | konsoleH → SSL Manager, Zuweisung prüfen | techn. Vorstand |
| **Versehentlich Inhalt gelöscht** | Über GitHub-Historie früheren Stand wiederherstellen | techn. Vorstand |
| **Material-Link tot** | Im Storage Share neuen Link erzeugen, auf der Seite ersetzen | Datei-Pflege |

Technische Details & komplette Anleitungen:
[`aufbau-und-hosting.md`](./aufbau-und-hosting.md) · [`../oauth/README.md`](../oauth/README.md)
