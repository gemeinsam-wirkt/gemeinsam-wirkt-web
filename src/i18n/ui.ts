/*
  Locale-Strings & Sprach-Konfiguration.
  DE ist Default (ohne URL-Präfix), EN ist strukturell vorbereitet, aber
  in dieser Phase NICHT inhaltlich befüllt (CLAUDE.md, Abschnitt 7).

  Neue UI-Texte hier eintragen – nicht im Markup hartkodieren, damit die
  spätere EN-Übersetzung ohne Umbau möglich ist.
*/

export const languages = {
  de: 'Deutsch',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'de';

export const ui = {
  de: {
    'site.name': 'gemeinsam wirkt',
    'site.tagline': 'Verein für Kooperation und gesellschaftliches Lernen',

    'nav.skip': 'Zum Hauptinhalt springen',
    'nav.menu': 'Menü',
    'nav.open': 'Menü öffnen',
    'nav.close': 'Menü schließen',
    'nav.language': 'Sprache wählen',

    'home.intro.title': 'Räume, in denen Zusammenarbeit gelingt',
    'home.intro.text':
      'Viele gute Ideen scheitern nicht am Wollen, sondern am gemeinsamen Tun. Wir öffnen Kooperationsräume, in denen Menschen aus Verwaltung, Zivilgesellschaft und Wirtschaft das Zusammenarbeiten erproben – geschützt, konkret, auf Augenhöhe.',
    'home.tiles.title': 'Wo möchtest du beginnen?',

    'newsletter.title': 'Bleib in Verbindung',
    'newsletter.text':
      'Wenn du wissen willst, woran wir gerade arbeiten und wann der nächste Kooperationsraum öffnet, trag dich in unseren Newsletter ein. Du entscheidest, du kannst dich jederzeit wieder abmelden.',
    'newsletter.email': 'E-Mail-Adresse',
    'newsletter.email.placeholder': 'name@beispiel.de',
    'newsletter.submit': 'Newsletter abonnieren',
    'newsletter.note':
      'Anmeldung mit Bestätigungslink (Double-Opt-In). Der Versand läuft über einen EU-Dienst. Mehr dazu in der Datenschutzerklärung.',
    'newsletter.placeholder':
      'Hinweis (Entwurf): Hier wird das Anmeldeformular des Newsletter-Dienstes eingebunden. Der Anbieter steht noch nicht fest.',

    'footer.contact': 'Kontakt',
    'footer.legal': 'Rechtliches',
    'footer.explore': 'Entdecken',
    'footer.rights': 'Alle Rechte vorbehalten.',

    'search.label': 'Suche',
    'search.placeholder': 'Website durchsuchen …',

    'lang.notice':
      'Die englische Fassung wird gerade aufgebaut. Schau bald wieder vorbei.',

    'list.empty': 'Hier entsteht gerade etwas. Bald gibt es hier mehr zu sehen.',
    'list.readmore': 'Weiterlesen',
    'event.register': 'Zur Anmeldung',
    'event.when': 'Wann',
    'event.where': 'Wo',
    'project.status': 'Status',
    'project.partner': 'Partner',
    'podcast.episode': 'Folge',
    'podcast.guests': 'Zu Gast',
    'back': 'Zurück zur Übersicht',
  },
  en: {
    // EN bewusst nur als Gerüst – Übersetzungen folgen in einer späteren Phase.
  },
} as const;

/** Liefert eine Übersetzungsfunktion für die gegebene Sprache (Fallback: DE). */
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)['de']): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}
