// Single source of truth for NAP, fees and hours. Every page, the footer and the
// JSON-LD read from here, so they can never drift apart (spec Part 10).
// Values marked TODO are waiting on the clinic (spec "Open items").

export const SITE = 'https://newporthomeopathy.com';

export const aiPrompt = `I am considering a private homeopathy consultation and want to understand Newport Homeopathy Clinic (newporthomeopathy.com) in Newport, Shropshire. Summarise who runs the clinic and her qualification, where it is, whether consultations are in person or online, the fees, opening hours, and how to book.`;
const q = encodeURIComponent(aiPrompt);
export const aiLinks = [
  { id: 'chatgpt', label: 'ChatGPT', href: `https://chatgpt.com/?q=${q}`, copy: false },
  { id: 'claude', label: 'Claude', href: `https://claude.ai/new?q=${q}`, copy: false },
  { id: 'gemini', label: 'Gemini', href: 'https://gemini.google.com/app', copy: true },
  { id: 'perplexity', label: 'Perplexity', href: `https://www.perplexity.ai/search?q=${q}`, copy: false },
];

export const pageUpdated: Record<string, string> = {
  '/': '2026-11-18',
  '/homeopathy-consultations/': '2026-11-18',
  '/online-homeopathy-consultation/': '2026-11-18',
  '/consultation-fees/': '2026-11-18',
  '/what-to-expect/': '2026-11-18',
  '/about-kavita-batchu/': '2026-11-18',
  '/areas-we-serve/': '2026-11-18',
  '/frequently-asked-questions/': '2026-11-18',
  '/contact/': '2026-11-18',
  '/blog/': '2026-11-17',
  '/book-appointment/': '2026-11-17',
  '/booking-terms/': '2026-11-17',
  '/privacy-policy/': '2026-11-17',
  '/cookie-policy/': '2026-11-17',
};

export function formatPageUpdated(path: string): string {
  const updated = pageUpdated[path];
  if (!updated) throw new Error(`Missing page update date for ${path}.`);

  const date = new Date(`${updated}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid page update date for ${path}: ${updated}.`);

  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const clinic = {
  name: 'Newport Homeopathy Clinic',
  practitioner: 'Kavita Batchu',
  title: 'Kavita Batchu, BHMS – Homeopath',
  qualification: 'BHMS',
  qualificationFull: 'Bachelor of Homoeopathic Medicine and Surgery (BHMS)',
  years: '15',
  alternateNames: ['Newport Homoeopathy Clinic', 'Newport Homeopathy'],
  phoneDisplay: '07904 622856',
  phoneIntl: '+44 7904 622856',
  phoneTel: '+447904622856',
  whatsapp: 'https://wa.me/447904622856?text=Hello%2C%20I%27d%20like%20to%20book%20a%20consultation',
  email: 'info@newporthomeopathy.com', // Clinic inbox: shown on the site and receives booking-form enquiries
  street: '75 Forton Road',
  locality: 'Newport',
  region: 'Shropshire',
  postcode: 'TF10 8BU',
  country: 'GB',
  hasMap: '', // TODO: confirm the Google Business Profile map URL
  geo: { lat: 52.7782, lng: -2.3783 }, // TODO: confirm against the GBP pin
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Newport+Homeopathy+Clinic%2C+75+Forton+Road%2C+Newport+TF10+8BU',
  hoursText: 'Monday–Saturday, 9:00–18:00',
  hoursShort: 'Mon–Sat, 9am–6pm',
  payment: 'Cash or bank transfer',
  // TODO: add only confirmed Google Business Profile URLs; never publish placeholders.
  sameAs: [] as string[],
  social: { facebook: '', instagram: '' },
};

export const addressLine = `${clinic.street}, ${clinic.locality}, ${clinic.region} ${clinic.postcode}`;

export const fees = {
  // Both local competitors lead with a free short call; it lowers the barrier to a first enquiry.
  discovery: { price: 0, label: 'Free discovery chat', duration: 'about 15 minutes' },
  initial: { price: 50, label: 'Initial consultation', duration: '30–90 minutes' },
  followUp: { price: 30, label: 'Follow-up consultation', duration: 'up to 60 minutes', interval: 'every 4–8 weeks' },
};

export const gpStatement =
  'Homeopathy is a complementary therapy. It is not a substitute for diagnosis or treatment by a medical professional. Please keep seeing your GP about any health concern, and do not stop or change prescribed medication without medical advice.';

export const gpStatementShort =
  'Homeopathy is a complementary therapy and not a substitute for medical care. Please keep seeing your GP.';

// Services the clinic offers. Describes the service only, never conditions or results (spec Part 3 / ASA).
export const services = [
  {
    title: 'In-person consultation', href: '/homeopathy-consultations/',
    price: `£${fees.initial.price}`, meta: fees.initial.duration,
  },
  {
    title: 'Online consultation', href: '/online-homeopathy-consultation/',
    price: `£${fees.initial.price}`, meta: fees.initial.duration,
  },
  {
    title: 'Follow-up consultation', href: '/consultation-fees/',
    price: `£${fees.followUp.price}`, meta: fees.followUp.duration,
  },
  {
    title: 'Free discovery chat', href: clinic.whatsapp,
    price: 'Free', meta: fees.discovery.duration,
  },
];

export const nav = [
  { href: '/', label: 'Home' },
  {
    label: 'Consultations',
    children: [
      { href: '/homeopathy-consultations/', label: 'In person (Newport)' },
      { href: '/online-homeopathy-consultation/', label: 'Online (UK-wide)' },
      { href: '/what-to-expect/', label: 'What to expect' },
    ],
  },
  { href: '/consultation-fees/', label: 'Fees' },
  { href: '/blog/', label: 'Guides' },
  { href: '/about-kavita-batchu/', label: 'About' },
  { href: '/frequently-asked-questions/', label: 'FAQs' },
  { href: '/contact/', label: 'Contact' },
];

// Patient feedback (spec Part 5 §7): experience-only quotes, approved in writing by the patient and clinic.
// No conditions or results. The home page section stays hidden while this list is empty.
export const reviews: { quote: string; name: string; source?: string }[] = [];

// Link for "Leave us a Google review" once the Google Business Profile is connected (TODO open item 10).
export const googleReviewUrl = '';

export const areas = [
  'Newport',
  'Telford',
  'Edgmond',
  'Gnosall',
  'Market Drayton',
  'Stafford',
  'Shrewsbury',
];

// One list renders both the visible FAQ and the FAQPage JSON-LD (spec Part 7).
// `link` is an internal page the answer points to (spec: FAQ answers link to the relevant page).
export type FaqGroup =
  | 'Booking and fees'
  | 'Your consultation'
  | 'Online appointments'
  | 'About homeopathy and Kavita';

type Faq = {
  q: string;
  a: string;
  group: FaqGroup;
  link?: { href: string; label: string };
};

export const faqs: Faq[] = [
  {
    q: 'How much does a homeopathy consultation cost?',
    a: `An initial consultation costs £${fees.initial.price} and lasts ${fees.initial.duration}; a follow-up costs £${fees.followUp.price}.`,
    group: 'Booking and fees',
    link: { href: '/consultation-fees/', label: 'See all fees' },
  },
  {
    q: 'How do I book?',
    a: `Book online, call ${clinic.phoneDisplay} or send a WhatsApp message. We reply within one working day.`,
    group: 'Booking and fees',
    link: { href: '/book-appointment/', label: 'Book a consultation' },
  },
  {
    q: 'Can I have a consultation online?',
    a: 'Yes. Online consultations are available by video anywhere in the UK.',
    group: 'Online appointments',
    link: { href: '/online-homeopathy-consultation/', label: 'Online consultations' },
  },
  {
    q: 'What happens at the first consultation?',
    a: `Kavita asks about your health history, lifestyle and wellbeing during the first appointment, which lasts ${fees.initial.duration}.`,
    group: 'Your consultation',
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'How often are follow-up appointments?',
    a: `Follow-ups are usually ${fees.followUp.interval}, and cost £${fees.followUp.price}.`,
    group: 'Your consultation',
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'Where is the clinic and is there parking?',
    a: `The clinic is at ${addressLine}. Parking and step-free access are available.`,
    group: 'Booking and fees',
    link: { href: '/contact/', label: 'Directions' },
  },
  {
    q: 'How can I pay?',
    a: `${clinic.payment}. Payment is taken at or before the appointment.`,
    group: 'Booking and fees',
    link: { href: '/booking-terms/', label: 'Booking terms' },
  },
  {
    q: 'Should I keep seeing my GP?',
    a: gpStatement,
    group: 'Your consultation',
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'Can I talk to someone before I book?',
    a: `Book a free discovery chat (${fees.discovery.duration}) by phone or WhatsApp; there is no obligation.`,
    group: 'Booking and fees',
    link: { href: '/book-appointment/', label: 'Request a free chat' },
  },
  {
    q: 'What is homeopathy?',
    a: 'Homeopathy is a system of complementary medicine developed by Samuel Hahnemann in the late 1700s. It is a complementary therapy and does not replace medical care from your GP. During a consultation, Kavita asks about your health history, lifestyle and wellbeing. Please continue to see your GP about health concerns.',
    group: 'About homeopathy and Kavita',
  },
  {
    q: 'Is it “homeopathy” or “homoeopathy”?',
    a: 'Both spellings are used in the UK and mean the same thing. “Homeopathy” is the common modern spelling, while “homoeopathy” is an older spelling used in the name of Kavita Batchu’s degree, Bachelor of Homoeopathic Medicine and Surgery (BHMS). The word “homoeopathy” is retained in that degree name.',
    group: 'About homeopathy and Kavita',
  },
  {
    q: 'Is homeopathy available on the NHS?',
    a: 'No, homeopathy is not routinely available on the NHS. Consultations at Newport Homeopathy Clinic are private. This answer refers to the clinic’s consultations and does not describe every local NHS service. For information about services in your area, check with your GP or local NHS service.',
    group: 'About homeopathy and Kavita',
  },
  {
    q: 'Are homeopaths regulated in the UK?',
    a: 'Homeopaths are not subject to statutory regulation in the UK. Some registers are voluntary, rather than a statutory requirement. This answer describes the general regulatory position only. For details of a particular register, consult the organisation that maintains it or its published information.',
    group: 'About homeopathy and Kavita',
  },
  {
    q: 'What qualification does Kavita have?',
    a: 'Kavita Batchu holds a BHMS qualification: Bachelor of Homoeopathic Medicine and Surgery. See the about page for details of her qualification and how she works.',
    group: 'About homeopathy and Kavita',
    link: { href: '/about-kavita-batchu/', label: 'About Kavita Batchu' },
  },
  {
    q: 'Do I need a referral from my GP?',
    a: 'No, you do not need a GP referral to book a consultation. You can contact the clinic directly to ask about an appointment. If you have a health concern, continue to seek advice from your GP. Homeopathy is a complementary therapy and is not a substitute for medical care.',
    group: 'Your consultation',
  },
  {
    q: 'Is my information kept confidential?',
    a: 'The privacy policy explains how your personal information is used and shared. It says enquiry details are used to reply and arrange appointments, describes the information collected and its retention period, and states that data is not sold or used with advertising pixels. For details, read the',
    group: 'Your consultation',
    link: { href: '/privacy-policy/', label: 'Privacy Policy' },
  },
];
