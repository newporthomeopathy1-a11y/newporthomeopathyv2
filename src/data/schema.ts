import { SITE, clinic, fees, faqs } from './site';

const clinicId = `${SITE}/#clinic`;
const personId = `${SITE}/about-kavita-batchu/#person`;

// Site-wide graph (spec Part 7). No Physician/MedicalClinic/medicalSpecialty, no "Dr".
export function siteGraph() {
  const business: Record<string, unknown> = {
    '@type': 'HealthAndBeautyBusiness',
    '@id': clinicId,
    name: clinic.name,
    url: `${SITE}/`,
    logo: `${SITE}/assets/img/logo.png`,
    image: `${SITE}/og-image.jpg`,
    description: 'Private homeopathy consultations in Newport, Shropshire and online across the UK.',
    telephone: clinic.phoneIntl,
    email: clinic.email,
    priceRange: `£${fees.followUp.price}–£${fees.initial.price}`,
    paymentAccepted: 'Cash, Bank transfer',
    currenciesAccepted: 'GBP',
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.street,
      addressLocality: clinic.locality,
      addressRegion: clinic.region,
      postalCode: clinic.postcode,
      addressCountry: clinic.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Newport, Shropshire' },
      { '@type': 'City', name: 'Telford' },
      { '@type': 'AdministrativeArea', name: 'Shropshire' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    employee: { '@id': personId },
  };
  if (clinic.sameAs.length) business.sameAs = clinic.sameAs;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: clinic.name,
        inLanguage: 'en-GB',
        publisher: { '@id': clinicId },
      },
    ],
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: clinic.title,
    jobTitle: 'Homeopath',
    url: `${SITE}/about-kavita-batchu/`,
    image: `${SITE}/assets/img/kavita-batchu.jpg`,
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: clinic.qualificationFull,
    },
    // TODO(open item 1): add memberOf + sameAs once the professional body is confirmed.
    worksFor: { '@id': clinicId },
  };
}

export function serviceSchema(kind: 'in-person' | 'online') {
  const online = kind === 'online';
  const path = online ? '/online-homeopathy-consultation/' : '/homeopathy-consultations/';
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE}${path}#service`,
    name: online ? 'Homeopathy consultation (online)' : 'Homeopathy consultation (in person)',
    serviceType: 'Homeopathy consultation',
    provider: { '@id': clinicId },
    areaServed: online
      ? { '@type': 'Country', name: 'United Kingdom' }
      : { '@type': 'AdministrativeArea', name: 'Shropshire' },
    ...(online
      ? { availableChannel: { '@type': 'ServiceChannel', name: 'Video call', serviceUrl: `${SITE}/book-appointment/` } }
      : {}),
    offers: [
      { '@type': 'Offer', name: 'Free discovery chat (about 15 minutes)', price: '0.00', priceCurrency: 'GBP' },
      { '@type': 'Offer', name: `Initial consultation (${fees.initial.duration})`, price: `${fees.initial.price}.00`, priceCurrency: 'GBP' },
      { '@type': 'Offer', name: 'Follow-up consultation', price: `${fees.followUp.price}.00`, priceCurrency: 'GBP' },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', href: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.href}`,
    })),
  };
}

export function faqSchema(list = faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function blogPostingSchema(p: { title: string; description: string; slug: string; published: Date; updated?: Date }) {
  const url = `${SITE}/blog/${p.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    datePublished: p.published.toISOString().slice(0, 10),
    dateModified: (p.updated ?? p.published).toISOString().slice(0, 10),
    author: { '@id': personId },
    publisher: { '@id': clinicId },
    image: `${SITE}/og-image.jpg`,
    mainEntityOfPage: url,
  };
}
