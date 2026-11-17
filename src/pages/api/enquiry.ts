// POST /api/enquiry — server-side handler for the booking form (spec Part 4).
// Runs as a Vercel function in production and inside `astro dev` locally.
// Env vars: RESEND_API_KEY (required to send), CLINIC_INBOX (optional, defaults to the clinic email),
// TURNSTILE_SECRET_KEY (required in production; optional in dev), and Upstash Redis REST credentials.
// Never logs form contents.
import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { clinic, fees, gpStatement } from '../../data/site';

export const prerender = false;

const FROM = 'Newport Homeopathy Clinic <noreply@newporthomeopathy.com>';
const INBOX = import.meta.env.CLINIC_INBOX || clinic.email;
const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL;
const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : undefined;

const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return count
`;

async function limited(ip: string) {
  if (!redis) {
    if (import.meta.env.DEV) return false;
    throw new Error('Upstash Redis REST credentials are required for enquiry rate limiting.');
  }
  const ipHash = createHash('sha256').update(ip).digest('hex');
  const count = await redis.eval<[number], number>(RATE_LIMIT_SCRIPT, [`enquiry:rate-limit:${ipHash}`], [3600]);
  return count > 5;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (v: FormDataEntryValue | null) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim();

function validate(f: FormData) {
  const errors: string[] = [];
  const name = oneLine(f.get('name'));
  const email = oneLine(f.get('email'));
  const phone = oneLine(f.get('phone'));
  const type = oneLine(f.get('type'));
  const format = oneLine(f.get('format'));
  if (name.length < 2 || name.length > 80) errors.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.push('email');
  if (!/^(\+44\s?|0)[0-9\s]{9,13}$/.test(phone)) errors.push('phone');
  if (!['discovery', 'initial', 'follow_up'].includes(type)) errors.push('type');
  if (!['in_person', 'online', 'phone'].includes(format)) errors.push('format');
  const rawTime = oneLine(f.get('time'));
  const time = ['morning', 'afternoon', 'late_afternoon'].includes(rawTime) ? rawTime : '';
  let date = '';
  const rawDate = oneLine(f.get('date'));
  if (rawDate) {
    const d = new Date(`${rawDate}T12:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (isNaN(+d) || d < today || d.getUTCDay() === 0) errors.push('date');
    else date = rawDate;
  }
  const message = String(f.get('message') ?? '').slice(0, 500);
  if (f.get('consent') !== 'yes') errors.push('consent');
  return { errors, data: { name, email, phone, type, format, date, time, message } };
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (import.meta.env.PROD) throw new Error('TURNSTILE_SECRET_KEY is required in production.');
    return import.meta.env.DEV;
  }
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  return ((await r.json()) as { success?: boolean }).success === true;
}

async function send(payload: Record<string, unknown>) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`email ${r.status}`);
}

const TYPE_LABEL: Record<string, string> = {
  discovery: 'Free 15-minute discovery call',
  initial: `Initial consultation (£${fees.initial.price})`,
  follow_up: `Follow-up consultation (£${fees.followUp.price})`,
};
const FORMAT_LABEL: Record<string, string> = { in_person: 'In person (Newport)', online: 'Online', phone: 'Phone' };

export const POST: APIRoute = async (ctx) => {
  const { request, redirect } = ctx;
  const ip = ctx.clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const back = (code: string) => redirect(`/book-appointment/?error=${code}#enquiry`, 303);

  try {
    if (await limited(ip)) return back('rate');
  } catch (error) {
    console.error('[enquiry] rate-limit check failed', error);
    return new Response('Enquiry rate limiting is temporarily unavailable. Please try again later or contact the clinic.', { status: 503 });
  }
  const form = await request.formData();
  if (oneLine(form.get('company'))) return redirect('/book-appointment/thank-you/', 303); // honeypot: silently drop
  let captchaVerified: boolean;
  try {
    captchaVerified = await verifyTurnstile(oneLine(form.get('cf-turnstile-response')), ip);
  } catch (error) {
    console.error('[enquiry] Turnstile verification failed', error);
    return back('captcha');
  }
  if (!captchaVerified) return back('captcha');

  const { errors, data } = validate(form);
  if (errors.length) return back(errors.join(','));

  const thanks = `/book-appointment/thank-you/?type=${data.type}&format=${data.format}`;

  // Local dev without email credentials: accept the enquiry so the full flow can be tested.
  if (!import.meta.env.RESEND_API_KEY) {
    if (import.meta.env.DEV) {
      console.log('[enquiry] valid submission received (email not sent: RESEND_API_KEY not set)');
      return redirect(thanks, 303);
    }
    return back('send');
  }

  const rows: [string, string][] = [
    ['Name', data.name], ['Email', data.email], ['Phone', data.phone],
    ['Type', TYPE_LABEL[data.type]], ['Format', FORMAT_LABEL[data.format]],
    ['Preferred date', data.date || '—'], ['Preferred time', data.time || '—'], ['Message', data.message || '—'],
  ];
  try {
    await send({
      from: FROM,
      to: [INBOX],
      reply_to: data.email,
      subject: `New enquiry: ${TYPE_LABEL[data.type]}, ${FORMAT_LABEL[data.format]}`,
      html: `<table>${rows.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`,
    });
    await send({
      from: FROM,
      to: [data.email],
      subject: 'We have received your enquiry – Newport Homeopathy Clinic',
      html: `<p>Hello ${esc(data.name)},</p><p>Thank you for your enquiry. We will reply within one working day. If it's urgent, please call ${clinic.phoneDisplay}.</p><p><small>${esc(gpStatement)}</small></p>`,
    });
  } catch {
    return back('send');
  }
  return redirect(thanks, 303);
};

export const ALL: APIRoute = () => new Response(null, { status: 405 });
