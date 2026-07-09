/*
  Zentrale Vereinsstammdaten – EINE Quelle für strukturierte Daten (JSON-LD).
  Bewusst getrennt von den per-CMS pflegbaren Collections: diese Angaben ändern
  sich selten und stammen aus Impressum/Kontakt. Bei Änderung hier zentral pflegen.

  Wird für das Organization-Schema (Startseite) und als organizer/publisher der
  Event- und NewsArticle-Schemata verwendet.
*/

export const site = {
  name: 'gemeinsam wirkt e.V.',
  /** Kurzform ohne Rechtsform – für Titel/Wortmarke. */
  shortName: 'gemeinsam wirkt',
  url: 'https://gemeinsam-wirkt.net',
  /** Pfad ab Site-Root; wird zur absoluten URL aufgelöst. */
  logo: '/logo.png',
  email: 'office@gemeinsam-wirkt.net',
  address: {
    street: 'Wilhelmstr. 18',
    postalCode: '79379',
    locality: 'Müllheim im Markgräflerland',
    country: 'DE',
  },
  /*
    Öffentliche Profile (Social, Register …) für schema.org "sameAs".
    Stärkt die Verknüpfung fürs Google Knowledge Panel. Sobald der Verein
    Profile hat (LinkedIn, Instagram …), hier die URLs eintragen.
  */
  sameAs: [] as string[],
} as const;

/**
 * Baut das schema.org-Organization-Objekt.
 * @param origin absolute Basis-URL (Astro.site), um logo relativ aufzulösen.
 */
export function organizationSchema(origin: URL | string) {
  const schema: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: new URL(site.logo, origin).href,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressCountry: site.address.country,
    },
  };
  if (site.sameAs.length > 0) schema.sameAs = site.sameAs;
  return schema;
}
