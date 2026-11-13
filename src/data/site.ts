// Single source of truth for NAP, fees and hours. Every page, the footer and the
// JSON-LD read from here, so they can never drift apart (spec Part 10).
// Values marked TODO are waiting on the clinic (spec "Open items").

export const SITE = 'https://newporthomeopathy.com';

export const clinic = {
  name: 'Newport Homeopathy Clinic',
  practitioner: 'Kavita Batchu',
  title: 'Kavita Batchu, BHMS – Homeopath', // TODO(open item 2): clinic to approve
  qualification: 'BHMS',
  qualificationFull: 'Bachelor of Homoeopathic Medicine and Surgery (BHMS)',
  years: '15',
  phoneDisplay: '07904 622856',
  phoneIntl: '+44 7904 622856',
  phoneTel: '+447904622856',
  whatsapp: 'https://wa.me/447904622856?text=Hello%2C%20I%27d%20like%20to%20book%20a%20consultation',
  email: 'cavitasuresh@yahoo.com', // Clinic inbox: shown on the site and receives booking-form enquiries
  street: '75 Forton Road',
  locality: 'Newport',
  region: 'Shropshire',
  postcode: 'TF10 8BU',
  country: 'GB',
  geo: { lat: 52.7782, lng: -2.3783 }, // TODO: confirm against the GBP pin
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Newport+Homeopathy+Clinic%2C+75+Forton+Road%2C+Newport+TF10+8BU',
  hoursText: 'Monday–Saturday, 9:00–18:00', // TODO(open item 5)
  hoursShort: 'Mon–Sat, 9am–6pm',
  payment: 'Cash or bank transfer', // TODO(open item 4)
  // Leave empty until real URLs exist. Never publish placeholders (spec Part 7).
  sameAs: [] as string[],
  social: { facebook: '', instagram: '' },
};

export const addressLine = `${clinic.street}, ${clinic.locality}, ${clinic.region} ${clinic.postcode}`;

export const fees = {
  // Both local competitors lead with a free short call; it lowers the barrier to a first enquiry.
  discovery: { price: 0, label: 'Free discovery chat', duration: 'about 15 minutes' }, // TODO: clinic to confirm length
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
    title: 'Free discovery chat', href: '/book-appointment/?type=discovery#enquiry',
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
export const faqs = [
  {
    q: 'How much does a homeopathy consultation cost?',
    a: `An initial consultation costs £${fees.initial.price} and lasts ${fees.initial.duration}; a follow-up costs £${fees.followUp.price}.`,
    link: { href: '/consultation-fees/', label: 'See all fees' },
  },
  {
    q: 'How do I book?',
    a: `Book online, call ${clinic.phoneDisplay} or send a WhatsApp message. We reply within one working day.`,
    link: { href: '/book-appointment/', label: 'Book a consultation' },
  },
  {
    q: 'Can I have a consultation online?',
    a: 'Yes. Online consultations are available by video anywhere in the UK.',
    link: { href: '/online-homeopathy-consultation/', label: 'Online consultations' },
  },
  {
    q: 'What happens at the first consultation?',
    a: `Kavita asks about your health history, lifestyle and wellbeing during the first appointment, which lasts ${fees.initial.duration}.`,
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'How often are follow-up appointments?',
    a: `Follow-ups are usually ${fees.followUp.interval}, and cost £${fees.followUp.price}.`,
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'Where is the clinic and is there parking?',
    a: `The clinic is at ${addressLine}. Please ask about parking and step-free access when you book.`, // TODO(open item 14)
    link: { href: '/contact/', label: 'Directions' },
  },
  {
    q: 'How can I pay?',
    a: `${clinic.payment}. Payment is taken at or before the appointment.`,
    link: { href: '/booking-terms/', label: 'Booking terms' },
  },
  {
    q: 'Should I keep seeing my GP?',
    a: gpStatement,
    link: { href: '/what-to-expect/', label: 'What to expect' },
  },
  {
    q: 'Can I talk to someone before I book?',
    a: `Book a free discovery chat (${fees.discovery.duration}) by phone or WhatsApp; there is no obligation.`,
    link: { href: '/book-appointment/', label: 'Request a free chat' },
  },
];
