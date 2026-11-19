import { SITE, areas, clinic, fees, faqs, pageUpdated } from './site';

const clinicId = `${SITE}/#clinic`;
const personId = `${SITE}/about-kavita-batchu/#person`;
const personNode = {
  '@type': 'Person',
  '@id': personId,
  name: clinic.practitioner,
  honorificSuffix: clinic.qualification,
  jobTitle: 'Homeopath',
  url: `${SITE}/about-kavita-batchu/`,
  image: `${SITE}/assets/img/kavita-batchu.jpg`,
  worksFor: { '@id': clinicId },
};

// Site-wide graph (spec Part 7). No Physician/MedicalClinic/medicalSpecialty, no "Dr".
export function siteGraph() {
  const business: Record<string, unknown> = {
    '@type': 'HealthAndBeautyBusiness',
    '@id': clinicId,
    name: clinic.name,
    alternateName: clinic.alternateNames,
    url: `${SITE}/`,
    logo: 'https://www.newporthomeopathy.com/assets/img/logo.png',
    image: `${SITE}/og-image.jpg`,
    description: `Private one-to-one homeopathy consultations with ${clinic.practitioner}, ${clinic.qualification}, at ${clinic.street}, ${clinic.locality}, ${clinic.region} ${clinic.postcode}, and online by video across the UK.`,
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
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    areaServed: [
      ...areas.map((name) => ({ '@type': 'City', name })),
      { '@type': 'AdministrativeArea', name: 'Shropshire' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    founder: { '@id': personId },
    employee: { '@id': personId },
    knowsAbout: [{
      '@type': 'Thing',
      name: 'Homeopathy',
      sameAs: 'https://en.wikipedia.org/wiki/Homeopathy',
    }],
  };
  const sameAs = clinic.sameAs.filter((url) => url.trim().length > 0);
  if (sameAs.length) business.sameAs = sameAs;
  if (clinic.hasMap.trim()) business.hasMap = clinic.hasMap;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      personNode,
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
    '@type': 'ProfilePage',
    url: `${SITE}/about-kavita-batchu/`,
    dateModified: pageUpdated['/about-kavita-batchu/'],
    mainEntity: {
      ...personNode,
      description: `Kavita Batchu is a BHMS-qualified homeopath with over ${clinic.years} years’ experience, offering private consultations in Newport, Shropshire and online across the UK.`,
      knowsAbout: ['Homeopathy'],
      knowsLanguage: ['en'],
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: clinic.qualificationFull,
      },
    },
  };
}

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE}/contact/#webpage`,
    url: `${SITE}/contact/`,
    name: 'Contact and directions',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': clinicId },
  };
}

export function collectionPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/blog/#webpage`,
    url: `${SITE}/blog/`,
    name: 'Guides and Articles',
    isPartOf: { '@id': `${SITE}/#website` },
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
      {
        '@type': 'Offer',
        name: 'Free discovery chat (about 15 minutes)',
        price: '0.00',
        priceCurrency: 'GBP',
        url: `${SITE}/book-appointment/`,
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: `Initial consultation (${fees.initial.duration})`,
        price: `${fees.initial.price}.00`,
        priceCurrency: 'GBP',
        url: `${SITE}/book-appointment/`,
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Follow-up consultation',
        price: `${fees.followUp.price}.00`,
        priceCurrency: 'GBP',
        url: `${SITE}/book-appointment/`,
        availability: 'https://schema.org/InStock',
      },
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
      acceptedAnswer: { '@type': 'Answer', text: f.link ? `${f.a} ${f.link.label}` : f.a },
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
    inLanguage: 'en-GB',
    author: { '@id': personId },
    publisher: { '@id': clinicId },
    image: `${SITE}/og-image.jpg`,
    mainEntityOfPage: url,
  };
}
