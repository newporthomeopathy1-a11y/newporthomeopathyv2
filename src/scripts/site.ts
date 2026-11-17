// Progressive enhancement only. Every page's content works without this file.

// ---------- Mobile menu: button toggle, focus trap, Esc to close ----------
document.documentElement.classList.add('js');
const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const navEl = document.getElementById('site-nav');
if (toggle && navEl) {
  const closeButton = navEl.querySelector<HTMLButtonElement>('.nav-close');
  const submenu = navEl.querySelector<HTMLElement>('.has-sub');
  const submenuToggle = submenu?.querySelector<HTMLButtonElement>('.consultations-toggle');
  const setSubmenuOpen = (open: boolean) => {
    submenu?.classList.toggle('open', open);
    submenuToggle?.setAttribute('aria-expanded', String(open));
  };
  let openedByHover = false;
  let scrollPosition = 0;
  const focusables = () =>
    Array.from(navEl.querySelectorAll<HTMLElement>('a, summary, button')).filter((el) =>
      el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.hasAttribute('disabled')
    );
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navEl.classList.toggle('open', open);
    if (open) {
      scrollPosition = window.scrollY;
      document.body.style.setProperty('--nav-scroll-offset', `${-scrollPosition}px`);
      document.body.style.setProperty('--nav-body-width', `${document.body.clientWidth}px`);
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
      document.body.style.removeProperty('--nav-scroll-offset');
      document.body.style.removeProperty('--nav-body-width');
      const scrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollPosition);
      document.documentElement.style.scrollBehavior = scrollBehavior;
    }
    if (open) (closeButton ?? focusables()[0])?.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  submenuToggle?.addEventListener('click', () => {
    const open = submenuToggle.getAttribute('aria-expanded') === 'true';
    setSubmenuOpen(openedByHover || !open);
    openedByHover = false;
  });
  submenu?.addEventListener('pointerenter', () => {
    if (window.matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine)').matches) {
      openedByHover = !submenu.classList.contains('open');
      setSubmenuOpen(true);
    }
  });
  submenu?.addEventListener('pointerleave', () => {
    if (openedByHover && !submenu.contains(document.activeElement)) setSubmenuOpen(false);
    openedByHover = false;
  });
  submenu?.addEventListener('focusout', (e) => {
    if (!submenu.contains(e.relatedTarget as Node | null)) {
      setSubmenuOpen(false);
      openedByHover = false;
    }
  });
  closeButton?.addEventListener('click', () => {
    setOpen(false);
    toggle.focus({ preventScroll: true });
  });
  navEl.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a') && navEl.classList.contains('open')) setOpen(false);
  });
  document.addEventListener('click', (e) => {
    if (submenu?.classList.contains('open') && !submenu.contains(e.target as Node)) setSubmenuOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && submenu?.classList.contains('open')) {
      setSubmenuOpen(false);
      submenuToggle?.focus({ preventScroll: true });
      e.preventDefault();
      return;
    }
    if (!navEl.classList.contains('open')) return;
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    } else if (e.key === 'Tab') {
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!navEl.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  const desktopBreakpoint = window.matchMedia('(min-width: 992px)');
  desktopBreakpoint.addEventListener('change', () => {
    setSubmenuOpen(false);
    openedByHover = false;
  });
  window.addEventListener('resize', () => {
    if (desktopBreakpoint.matches && navEl.classList.contains('open')) setOpen(false);
  });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    const wasLocked = document.body.classList.contains('nav-open');
    const restoreY = wasLocked ? scrollPosition : window.scrollY;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    navEl.classList.remove('open');
    setSubmenuOpen(false);
    openedByHover = false;
    document.body.classList.remove('nav-open');
    document.body.style.removeProperty('--nav-scroll-offset');
    document.body.style.removeProperty('--nav-body-width');
    if (wasLocked) {
      const scrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, restoreY);
      document.documentElement.style.scrollBehavior = scrollBehavior;
    }
  });
}

// ---------- Map facade: keep third-party map code off the initial load ----------
document.querySelectorAll<HTMLElement>('.map-facade[data-map-src]').forEach((facade) => {
  const button = facade.querySelector<HTMLButtonElement>('.map-load');
  const frame = facade.querySelector<HTMLElement>('.map-frame');
  if (!button || !frame) return;

  let started = false;
  const loadMap = () => {
    const src = facade.dataset.mapSrc;
    if (started || !src) return;
    started = true;

    const iframe = document.createElement('iframe');
    iframe.title = facade.dataset.mapTitle ?? '';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => facade.classList.add('map-loaded'), { once: true });
    iframe.src = src;
    frame.append(iframe);
  };

  button.addEventListener('click', loadMap);
});

// ---------- Consent + GA4 (spec Part 9) ----------
declare global {
  interface Window { gtag: (...args: unknown[]) => void; dataLayer: unknown[]; __GA_ID: string }
}
const CONSENT_KEY = 'nhc_consent';
const banner = document.querySelector<HTMLElement>('.cookie-banner');
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const writeConsent = (v: string) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode */ } };

let gaLoaded = false;
let gaScheduled = false;
function loadGa() {
  const id = window.__GA_ID;
  if (!id || gaLoaded) return;
  if (typeof window.gtag !== 'function') return;
  gaLoaded = true;
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  window.gtag('config', id);
}

function scheduleGa() {
  if (!window.__GA_ID || gaLoaded || gaScheduled) return;
  gaScheduled = true;
  const run = () => {
    gaScheduled = false;
    if (document.visibilityState === 'visible') loadGa();
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2000 });
  else globalThis.setTimeout(run, 1000);
}

function setBannerVisible(visible: boolean) {
  if (!banner) return;
  banner.hidden = !visible;
  document.body.classList.toggle('cookie-visible', visible);
}

function syncConsentBanner() {
  if (!window.__GA_ID || !banner) {
    setBannerVisible(false);
    return;
  }
  const consent = readConsent();
  setBannerVisible(!consent);
  if (consent === 'accept') scheduleGa();
}

// Only show the banner when analytics is actually configured.
if (window.__GA_ID && banner) {
  syncConsentBanner();
  banner.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-consent]');
    if (!btn) return;
    writeConsent(btn.dataset.consent!);
    setBannerVisible(false);
    if (btn.dataset.consent === 'accept') scheduleGa();
  });
}
document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
  if (banner && window.__GA_ID) setBannerVisible(true);
});

window.addEventListener('pageshow', syncConsentBanner);

const BOOKING_MESSAGE_ORIGINS: string[] = [window.location.origin];
const bookingValues = {
  consultation_type: ['discovery', 'initial', 'follow_up'],
  format: ['in_person', 'online', 'phone'],
};
function trackEvent(eventName: string, params: Record<string, string>) {
  if (readConsent() !== 'accept' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (!BOOKING_MESSAGE_ORIGINS.includes(event.origin)) return;
  if (!event.data || typeof event.data !== 'object' || Array.isArray(event.data)) return;

  const data = event.data as Record<string, unknown>;
  if (data.type !== 'booking_complete') return;

  const allowed = (value: unknown, options: string[]) =>
    typeof value === 'string' && options.includes(value) ? value : 'unknown';
  trackEvent('booking_complete', {
    consultation_type: allowed(data.consultation_type, bookingValues.consultation_type),
    format: allowed(data.format, bookingValues.format),
  });

  const frameWrap = document.getElementById('booking-frame-wrap');
  if (frameWrap) {
    const confirmation = document.createElement('p');
    confirmation.className = 'booking-confirmation';
    confirmation.textContent = 'Booking confirmed. Check your email.';
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.textContent = 'Return to the home page';
    frameWrap.replaceChildren(confirmation, homeLink);
  }
});

// ---------- Delegated click tracking on [data-track] (no personal data) ----------
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (!el) return;
  trackEvent(el.dataset.track!, { link_location: el.dataset.loc ?? 'page' });
});

// ---------- Thank-you page: generate_lead with non-personal params only ----------
const lead = document.querySelector<HTMLElement>('[data-lead-event]');
const bookingReturnInFrame = new URLSearchParams(location.search).get('source') === 'booking' && window.top !== window.self;
if (lead && !bookingReturnInFrame) {
  const p = new URLSearchParams(location.search);
  const allowed = (v: string | null, opts: string[]) => (v && opts.includes(v) ? v : 'unknown');
  trackEvent('generate_lead', {
    consultation_type: allowed(p.get('type'), ['discovery', 'initial', 'follow_up']),
    format: allowed(p.get('format'), ['in_person', 'online', 'phone']),
  });
}

// ---------- Enquiry form: client-side hints (server re-validates everything) ----------
const form = document.querySelector<HTMLFormElement>('form.enquiry-form');
if (form) {
  const turnstile = form.querySelector<HTMLElement>('.cf-turnstile');
  if (turnstile) {
    let turnstileRequested = false;
    let turnstileObserver: IntersectionObserver | undefined;
    const loadTurnstile = () => {
      if (turnstileRequested) return;
      turnstileRequested = true;
      turnstileObserver?.disconnect();
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.append(script);
    };

    form.addEventListener('focusin', loadTurnstile, { once: true });
    if ('IntersectionObserver' in window) {
      turnstileObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadTurnstile();
      }, { rootMargin: '200px' });
      turnstileObserver.observe(turnstile);
    }
  }

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
