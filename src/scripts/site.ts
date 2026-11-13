// Progressive enhancement only. Every page's content works without this file.

// ---------- Mobile menu: button toggle, focus trap, Esc to close ----------
const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const navEl = document.getElementById('site-nav');
if (toggle && navEl) {
  const focusables = () =>
    Array.from(navEl.querySelectorAll<HTMLElement>('a, summary, button')).filter((el) => el.offsetParent !== null);
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navEl.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) focusables()[0]?.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (!navEl.classList.contains('open')) return;
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    } else if (e.key === 'Tab') {
      const items = [toggle, ...focusables()];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// ---------- Consent + GA4 (spec Part 9) ----------
declare global {
  interface Window { gtag: (...args: unknown[]) => void; dataLayer: unknown[]; __GA_ID: string }
}
const CONSENT_KEY = 'nhc_consent';
const banner = document.querySelector<HTMLElement>('.cookie-banner');
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const writeConsent = (v: string) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode */ } };

let gaLoaded = false;
function loadGa() {
  const id = window.__GA_ID;
  if (!id || gaLoaded) return;
  gaLoaded = true;
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  window.gtag('config', id);
}

// Only show the banner when analytics is actually configured.
if (window.__GA_ID && banner) {
  const c = readConsent();
  if (c === 'accept') loadGa();
  else if (!c) banner.hidden = false;
  banner.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-consent]');
    if (!btn) return;
    writeConsent(btn.dataset.consent!);
    banner.hidden = true;
    if (btn.dataset.consent === 'accept') loadGa();
  });
}
document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
  if (banner && window.__GA_ID) banner.hidden = false;
});

// TODO: Add the selected booking provider's exact origin after its message contract is confirmed.
const BOOKING_MESSAGE_ORIGINS: string[] = [];
const bookingValues = {
  consultation_type: ['discovery', 'initial', 'follow_up'],
  format: ['in_person', 'online', 'phone'],
};
window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (!BOOKING_MESSAGE_ORIGINS.includes(event.origin)) return;
  if (!event.data || typeof event.data !== 'object' || Array.isArray(event.data)) return;

  const data = event.data as Record<string, unknown>;
  if (data.type !== 'booking_complete') return;

  const allowed = (value: unknown, options: string[]) =>
    typeof value === 'string' && options.includes(value) ? value : 'unknown';
  window.gtag('event', 'booking_complete', {
    consultation_type: allowed(data.consultation_type, bookingValues.consultation_type),
    format: allowed(data.format, bookingValues.format),
  });
});

// ---------- Delegated click tracking on [data-track] (no personal data) ----------
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (!el) return;
  window.gtag('event', el.dataset.track!, { link_location: el.dataset.loc ?? 'page' });
});

// ---------- Thank-you page: generate_lead with non-personal params only ----------
const lead = document.querySelector<HTMLElement>('[data-lead-event]');
if (lead) {
  const p = new URLSearchParams(location.search);
  const allowed = (v: string | null, opts: string[]) => (v && opts.includes(v) ? v : 'unknown');
  window.gtag('event', 'generate_lead', {
    consultation_type: allowed(p.get('type'), ['discovery', 'initial', 'follow_up']),
    format: allowed(p.get('format'), ['in_person', 'online', 'phone']),
  });
}

// ---------- Click-to-load map ----------
document.querySelectorAll<HTMLElement>('.map-facade').forEach((wrap) => {
  wrap.querySelector('.map-load')?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = wrap.dataset.mapSrc!;
    iframe.title = 'Map showing Newport Homeopathy Clinic, 75 Forton Road, Newport TF10 8BU';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    wrap.replaceChildren(iframe);
  });
});

// ---------- Enquiry form: client-side hints (server re-validates everything) ----------
const form = document.querySelector<HTMLFormElement>('form.enquiry-form');
if (form) {
  const date = form.querySelector<HTMLInputElement>('input[type="date"]');
  if (date) {
    date.min = new Date().toISOString().slice(0, 10);
    date.addEventListener('change', () => {
      const day = date.value ? new Date(date.value + 'T12:00:00').getDay() : 1;
      date.setCustomValidity(day === 0 ? 'The clinic is closed on Sundays. Please pick Monday to Saturday.' : '');
    });
  }
  const status = form.querySelector<HTMLElement>('[role="alert"]');
  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      const firstBad = form.querySelector<HTMLElement>(':invalid');
      if (status) status.textContent = 'Please check the highlighted fields.';
      form.querySelectorAll<HTMLInputElement>('input, select, textarea').forEach((f) => {
        const err = document.getElementById(`${f.id}-error`);
        if (err) err.textContent = f.validity.valid ? '' : f.validationMessage;
        f.setAttribute('aria-invalid', String(!f.validity.valid));
      });
      firstBad?.focus();
    }
  });
}

export {};
