import type { APIRoute } from 'astro';
import { SITE, areas, clinic, fees, gpStatement } from '../data/site';

export const prerender = true;

const pages = [
  ['In-person consultations', '/homeopathy-consultations/'],
  ['Online consultations', '/online-homeopathy-consultation/'],
  ['Fees', '/consultation-fees/'],
  ['What to expect', '/what-to-expect/'],
  ['About Kavita Batchu', '/about-kavita-batchu/'],
  ['Areas we serve', '/areas-we-serve/'],
  ['FAQs', '/frequently-asked-questions/'],
  ['Guides', '/blog/'],
  ['Book a consultation', '/book-appointment/'],
  ['Contact and directions', '/contact/'],
];

const content = `# ${clinic.name}

> Private, one-to-one homeopathy (also spelled homoeopathy) consultations with ${clinic.practitioner}, ${clinic.qualification}, a homeopath with over ${clinic.years} years’ experience, at ${clinic.street}, ${clinic.locality}, ${clinic.region} ${clinic.postcode}, and online by video anywhere in the UK.

## Key facts

- Practitioner: ${clinic.practitioner}; ${clinic.qualificationFull}.
- Fees: ${fees.discovery.label}; ${fees.initial.label}, £${fees.initial.price}, ${fees.initial.duration}; ${fees.followUp.label}, £${fees.followUp.price}, usually ${fees.followUp.interval}; the same fees apply online.
- Hours: ${clinic.hoursText}.
- Contact: phone ${clinic.phoneDisplay}; WhatsApp ${clinic.whatsapp}; booking ${SITE}/book-appointment/.
- Areas: ${areas.join(', ')}; online consultations anywhere in the UK.
- ${gpStatement}

## Pages

${pages.map(([label, path]) => `- [${label}](${SITE}${path})`).join('\n')}
`;

export const GET: APIRoute = () =>
  new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
