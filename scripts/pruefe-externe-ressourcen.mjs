/**
 * Prueft die fertig gebaute Website (dist/) auf Dinge, die dort nicht hingehoeren.
 *
 * Hintergrund: Eigenstaendige HTML-Seiten, die ueber das CMS nach public/dokumente
 * hochgeladen werden, bringen regelmaessig zwei Sachen mit, die beim Hochladen
 * niemandem auffallen:
 *
 *   1. Schriften von Google-Servern. Damit fliessen die IP-Adressen der Besucher
 *      zu einem Drittanbieter – ausgeschlossen in CLAUDE.md, Abschnitt 10.
 *   2. Technik aus dem Artifact-Viewer (frame-runtime): minifiziertes JavaScript,
 *      das Nachrichten an ein uebergeordnetes Fenster schickt und Dateien nachlaedt,
 *      die es auf diesem Server nicht gibt.
 *
 * Beides ist auf einer oeffentlichen Vereinsseite unerwuenscht, aber unsichtbar –
 * die Seite sieht voellig normal aus. Deshalb faellt der Build lieber auf, als dass
 * so etwas still online geht.
 *
 * Laeuft automatisch als Teil von `npm run build`.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath statt URL.pathname: auf Windows liefert pathname sonst „/C:/…"
// samt Prozent-Kodierung (aus Leerzeichen wird %20) und nichts findet mehr statt.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/** Was gesucht wird – Suchbegriff, Klartext-Erklaerung und was zu tun ist. */
const VERBOTEN = [
  {
    muster: /fonts\.googleapis\.com|fonts\.gstatic\.com/g,
    was: 'Schriften werden von Google-Servern geladen',
    tun: 'Die <link>-Zeilen auf fonts.googleapis.com/fonts.gstatic.com ersatzlos loeschen. '
      + 'Die Schrift-Angaben in der Datei fallen dann auf Georgia bzw. system-ui zurueck.',
  },
  {
    muster: /__FRAME_PREAMBLE|<!-- frame-runtime -->/g,
    was: 'Artifact-Viewer-Technik (frame-runtime) in der Seite',
    tun: 'Den Block zwischen <!-- frame-runtime --> und <!-- /frame-runtime --> im <head> '
      + 'komplett entfernen. Die eigenen Skripte der Seite (Animationen, Zaehler) bleiben.',
  },
];

/** Alle .html-Dateien unterhalb von dir einsammeln. */
async function htmlDateien(dir) {
  const gefunden = [];
  for (const eintrag of await readdir(dir, { withFileTypes: true })) {
    const pfad = join(dir, eintrag.name);
    if (eintrag.isDirectory()) gefunden.push(...(await htmlDateien(pfad)));
    else if (eintrag.name.endsWith('.html')) gefunden.push(pfad);
  }
  return gefunden;
}

/** Zeilennummer zu einer Zeichenposition – damit der Hinweis auffindbar ist. */
const zeileVon = (text, pos) => text.slice(0, pos).split('\n').length;

const treffer = [];
for (const datei of await htmlDateien(DIST)) {
  const inhalt = await readFile(datei, 'utf8');
  for (const regel of VERBOTEN) {
    for (const m of inhalt.matchAll(regel.muster)) {
      // Auf Windows liefert relative() Backslashes – vereinheitlichen, damit der
      // Hinweis genauso aussieht wie ein Pfad im Repo.
      const rel = relative(DIST, datei).split(sep).join('/');
      treffer.push({ datei: rel, zeile: zeileVon(inhalt, m.index), regel });
    }
  }
}

if (treffer.length === 0) {
  console.log('✓ Keine externen Schriften und keine Viewer-Technik in dist/ gefunden.');
  process.exit(0);
}

// Nach Datei und Regel buendeln, damit 20 Treffer in einer Datei nicht 20 Absaetze werden.
const gruppen = new Map();
for (const t of treffer) {
  const schluessel = `${t.datei}\u0000${t.regel.was}`;
  if (!gruppen.has(schluessel)) gruppen.set(schluessel, { ...t, zeilen: [] });
  const g = gruppen.get(schluessel);
  // Ein minifizierter Block liefert Dutzende Fundstellen in derselben Zeile –
  // die Zeile einmal zu nennen genuegt.
  if (!g.zeilen.includes(t.zeile)) g.zeilen.push(t.zeile);
}

console.error('\n✗ Build gestoppt: In der fertigen Website steckt etwas, das dort nicht hingehoert.\n');
for (const g of gruppen.values()) {
  const quelle = g.datei.startsWith('dokumente')
    ? `public/${g.datei}`
    : `dist/${g.datei} (stammt aus public/ oder aus einer Seitenvorlage)`;
  console.error(`  ${g.regel.was}`);
  console.error(`    Datei:  ${quelle}`);
  console.error(`    Zeile:  ${g.zeilen.slice(0, 5).join(', ')}${g.zeilen.length > 5 ? ` … und ${g.zeilen.length - 5} weitere` : ''}`);
  console.error(`    Zu tun: ${g.regel.tun}\n`);
}
console.error('Danach `npm run build` erneut ausfuehren. Details: CLAUDE.md, Abschnitt 10.\n');
process.exit(1);
