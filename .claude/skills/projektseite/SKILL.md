---
name: projektseite
description: Erstellt eine eigenstaendige HTML-Seite (One-Pager) fuer ein Projekt von gemeinsam wirkt e.V., die auf gemeinsam-wirkt.net veroeffentlicht wird. Nutze diesen Skill bei Anfragen wie "Projektseite fuer X", "One-Pager", "Landingpage", "HTML-Seite fuer das Projekt", "Foerderdarstellung als Webseite" - und ebenso, wenn eine bestehende solche Seite ueberarbeitet werden soll. Enthaelt die verbindlichen DSGVO- und Technikregeln, ohne die die Seite auf der Website nicht gebaut wird.
---

# Projektseite als eigenstaendige HTML-Datei

## Wofuer das gedacht ist

Manche Projekte brauchen mehr als den kurzen Text auf der Projektseite im CMS:
Zahlen, einen Ablauf, eine Grafik, eine Foerderdarstellung. Dafuer entsteht **eine
einzelne HTML-Datei**, die unter `gemeinsam-wirkt.net/dokumente/<name>.html` liegt
und von der CMS-Projektseite aus verlinkt wird.

Diese Datei bringt ihr eigenes Aussehen mit. Sie ist bewusst **nicht** in das
Website-Layout eingebunden - sie steht fuer sich und laeuft auch als Datei, die man
per Mail weitergibt.

## Die harten Regeln

Diese vier Punkte sind nicht verhandelbar. Die ersten beiden werden bei jedem Build
automatisch geprueft (`npm run pruefe`); eine Verletzung stoppt das Deployment.

### 1. Keine Ressourcen von fremden Servern

Der Verein hat ein Impressum und damit ein reales Abmahnrisiko. Sobald der Browser
eines Besuchers etwas von einem fremden Server laedt, fliesst dessen IP-Adresse
dorthin - ohne Einwilligung.

**Verboten, ohne Ausnahme:**

- `fonts.googleapis.com`, `fonts.gstatic.com` und jedes andere Schrift-CDN
- extern eingebundene Stylesheets, Skripte, Bilder, Videos, Icon-Pakete
- Analyse-, Karten- oder Einbettungsdienste

**Statt dessen:** Die Seite ist **eine einzige, in sich geschlossene Datei**. CSS im
`<style>`, JavaScript im `<script>`, Bilder als `data:`-URI. Extern verlinkte Bilder
werden in der veroeffentlichten Fassung ohnehin blockiert und bleiben leer.

### 2. Schriften: die vorhandenen benutzen

Keine Schrift nachladen. Diese beiden Stacks decken alles ab und sehen auf jedem
System vernuenftig aus:

```css
--serif: Georgia, 'Times New Roman', serif;                 /* Ueberschriften */
--sans:  system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;  /* Fliesstext */
```

Wird eine bestimmte Schrift wirklich gebraucht, muss sie als `data:`-URI im
`@font-face` eingebettet werden - das blaeht die Datei aber stark auf. Im Zweifel:
Georgia und system-ui nehmen.

### 3. Die Datei muss als Datei entstehen

Wird eine gerenderte Artifact-Seite ueber den Browser gespeichert, schreibt der
Viewer einen Block `<!-- frame-runtime -->…<!-- /frame-runtime -->` mit rund 13 KB
fremdem JavaScript in den `<head>` - Nachrichten an ein uebergeordnetes Fenster,
Nachladen von `/_runtime/*.js`, Klick-Hooks. Auf der Vereinsseite ist das nutzlos
und unerwuenscht.

**Also:** Die Datei mit dem Schreib-Werkzeug auf die Platte schreiben bzw. die
Quelldatei herunterladen - nicht die angezeigte Seite abspeichern. Danach pruefen:

```bash
grep -c "googleapis\|gstatic\|FRAME_PREAMBLE" <datei>   # muss 0 ergeben
```

### 4. Dateiname ohne Umlaute und Leerzeichen

Nur `a-z`, `0-9` und `-`. Der Name durchlaeuft CMS, Git, SFTP-Upload und URL; ein
Umlaut kann auf jeder dieser Stationen kippen. Beispiel:
`wassernutzer-im-dialog.html`.

## Technische Vorgaben

- `<!DOCTYPE html>`, `<html lang="de">`, `<meta charset="utf-8">`, Viewport-Meta,
  ein sprechender `<title>` - er steht spaeter im Browser-Tab.
- Genau **ein** `<h1>`, darunter eine saubere Gliederung mit `<h2>`/`<h3>`.
- **Responsiv bis Handy.** Relative Einheiten, Flexbox/Grid, `max-width:100%` fuer
  Bilder. Kein waagerechtes Scrollen der Seite; breite Tabellen oder Diagramme in
  einen eigenen Container mit `overflow-x:auto`.
- **Sichtbarer Tastatur-Fokus:** `:focus-visible` mit deutlichem Outline. Wird oft
  vergessen - ohne ihn ist die Seite per Tastatur nicht bedienbar.
- **Sprunglink** ganz oben zum Hauptinhalt, bis zum Fokus optisch versteckt.
- **`prefers-reduced-motion` respektieren.** Animationen und hochzaehlende Zahlen
  muessen bei aktivierter Einstellung sofort ihren Endzustand zeigen, nicht nur
  langsamer laufen.
- **Kontraste nach WCAG AA:** 4,5:1 fuer Fliesstext, 3:1 fuer grosse Ueberschriften.
- Jedes `<img>` braucht ein `alt`; rein dekorative Grafiken bekommen `alt=""`.
  Inline-SVG mit Aussage bekommt `role="img"` und ein `<title>`.
- Quellenangaben zu Zahlen direkt an die Zahl, nicht nur ins Impressum.

## Sprache

Es gilt der Brand Voice Guide aus `CLAUDE.md`, Abschnitt 8:

- **Du-Ansprache** durchgaengig.
- Aufbau: **Problem benennen → Perspektive wechseln → konkrete Handlung.**
- Aktiv statt Passiv, kurze Saetze, Verben statt Nominalstil.
- **Vermeiden:** „Win-Win", „neue Wege gehen", „nachhaltig", „Deep Dive",
  Marketing-Floskeln, Woerter in Grossbuchstaben.
- **Bevorzugt:** Kooperationsraum, Praxislabor, erleben/erproben, geschuetzter Raum,
  Prozessbegleitung, Befaehigung.

## Vorgehen

1. `vorlage.html` aus diesem Skill-Ordner als Ausgangspunkt nehmen - sie erfuellt
   die Regeln oben bereits.
2. Inhalt und Farbwelt zum Thema entwickeln. Eine eigene Palette ist ausdruecklich
   erlaubt, die Kontrastwerte muessen aber stimmen.
3. Datei nach `public/dokumente/<name>.html` schreiben.
4. Verlinken - im CMS, ohne Code:
   - **Projekt:** Feld „Ausfuehrliche Fassung (Datei, optional)" in der
     Projekte-Collection. Die Projektseite zeigt dann automatisch einen Button.
   - **Material:** Feld „Eigene Datei hochladen (statt Link)" in der
     Materialien-Collection.
   - Eine URL in ein Textfeld zu schreiben bringt nichts - daraus wird nur eine
     anklickbare Zeile, keine eingebettete Seite.
5. `npm run build` laufen lassen. Die Pruefung am Ende muss gruen sein.

## Checkliste vor der Uebergabe

- [ ] `grep -c "googleapis\|gstatic\|FRAME_PREAMBLE" <datei>` ergibt 0
- [ ] Datei oeffnet sich offline korrekt (Netzwerk trennen und im Browser oeffnen)
- [ ] Bei 360 px Breite kein waagerechtes Scrollen
- [ ] Mit der Tabulatortaste durchgehen: Fokus ist jederzeit sichtbar
- [ ] Mit aktiviertem „Bewegung reduzieren" ist sofort alles lesbar
- [ ] Dateiname nur `a-z`, `0-9`, `-`
- [ ] `npm run build` laeuft durch
