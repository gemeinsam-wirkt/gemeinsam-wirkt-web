/*
  i18n-Hilfsfunktionen: Sprache aus der URL lesen, Pfade übersetzen, Daten
  lokalisiert formatieren. DE ohne Präfix, EN unter /en/.
*/

import { defaultLang, type Lang } from './ui';

/** Ermittelt die aktive Sprache aus dem URL-Pfad (z. B. /en/... → 'en'). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg === 'en') return 'en';
  return defaultLang;
}

/** Entfernt das Sprach-Präfix und liefert den „neutralen" Pfad zurück. */
export function stripLangPrefix(pathname: string): string {
  const cleaned = pathname.replace(/^\/en(?=\/|$)/, '');
  return cleaned === '' ? '/' : cleaned;
}

/** Baut einen Pfad für die Zielsprache (DE ohne, EN mit /en-Präfix). */
export function localizePath(pathname: string, lang: Lang): string {
  const base = stripLangPrefix(pathname);
  if (lang === defaultLang) return base;
  return base === '/' ? '/en' : `/en${base}`;
}

/** Formatiert ein Datum lokalisiert (Standard: ausgeschriebener Monat). */
export function formatDate(
  date: Date,
  lang: Lang = defaultLang,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const locale = lang === 'en' ? 'en-GB' : 'de-DE';
  return new Intl.DateTimeFormat(locale, opts).format(date);
}

/** Formatiert eine Veranstaltungszeit (Datum + Uhrzeit). */
export function formatDateTime(date: Date, lang: Lang = defaultLang): string {
  return formatDate(date, lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
