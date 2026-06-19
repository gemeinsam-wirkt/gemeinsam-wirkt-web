/*
  Informationsarchitektur als zentrale Datenquelle (CLAUDE.md, Abschnitt 3).
  Header-Navigation, Footer und die Kachel-Startseite leiten sich hieraus ab,
  damit die Struktur nur an EINER Stelle gepflegt wird.

  Hinweis IA: „News" ist kanonisch unter /der-verein/news geführt und wird an
  anderen Stellen nur angeteasert.
*/

export type NavItem = {
  label: string;
  href: string;
  /** Kurztext für Kacheln & Übersichtsseiten. */
  beschreibung?: string;
  children?: NavItem[];
};

export const mainNav: NavItem[] = [
  {
    label: 'Der Verein',
    href: '/der-verein',
    beschreibung:
      'Wofür wir stehen, wer dahintersteht und mit wem wir zusammenarbeiten.',
    children: [
      { label: 'Zweck', href: '/der-verein/zweck' },
      { label: 'Über uns', href: '/der-verein/ueber-uns' },
      { label: 'Kooperationspartner', href: '/der-verein/kooperationspartner' },
      { label: 'News', href: '/der-verein/news' },
    ],
  },
  {
    label: 'Projekte & Veranstaltungen',
    href: '/projekte-und-veranstaltungen',
    beschreibung: 'Woran wir arbeiten, wo du dabei sein kannst und was wir hörbar machen.',
    children: [
      { label: 'Projekte', href: '/projekte-und-veranstaltungen/projekte' },
      {
        label: 'Veranstaltungen & Termine',
        href: '/projekte-und-veranstaltungen/veranstaltungen',
      },
      { label: 'Podcasts', href: '/projekte-und-veranstaltungen/podcasts' },
    ],
  },
  {
    label: 'Materialien',
    href: '/materialien',
    beschreibung: 'Veröffentlichungen und Materialien zum Nachlesen und Weitergeben.',
  },
  {
    label: 'Spenden',
    href: '/spenden',
    beschreibung: 'So unterstützt du unsere Arbeit ganz konkret.',
  },
  {
    label: 'Sponsoren',
    href: '/sponsoren',
    beschreibung: 'Wer unsere Kooperationsräume möglich macht.',
  },
  {
    label: 'Kontakt',
    href: '/kontakt',
    beschreibung: 'Schreib uns – wir freuen uns auf den Austausch.',
  },
];

/** Rechtliche Links für den Footer. */
export const legalNav: NavItem[] = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutzerklärung', href: '/datenschutz' },
];
