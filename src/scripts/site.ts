// Progressive enhancement only. Every page's content works without this file.

declare global {
  interface Window {
    __nhcTurnstileSuccess?: (token: string) => void;
  }
}

document.documentElement.classList.add('js');

const BOOKING_MESSAGE_ORIGINS: string[] = [window.location.origin];
const desktopBreakpoint = window.matchMedia('(min-width: 992px)');

let leaveTimer: number | undefined;
let openedByHover = false;
let scrollPosition = 0;
let askAiStatusTimer: number | undefined;

function setSubmenuOpen(open: boolean) {
  const submenu = document.querySelector<HTMLElement>('.site-nav .has-sub');
  const submenuToggle = submenu?.querySelector<HTMLButtonElement>('.consultations-toggle');
  submenu?.classList.toggle('open', open);
  submenuToggle?.setAttribute('aria-expanded', String(open));
}

function clearLeaveTimer() {
  if (leaveTimer !== undefined) {
    window.clearTimeout(leaveTimer);
    leaveTimer = undefined;
  }
}

function unlockBodyScroll() {
  document.body.classList.remove('nav-open');
  document.body.style.removeProperty('--nav-scroll-offset');
  document.body.style.removeProperty('--nav-body-width');
}

function setMenuOpen(open: boolean) {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const closeButton = nav.querySelector<HTMLButtonElement>('.nav-close');
  const focusables = () =>
    Array.from(nav.querySelectorAll<HTMLElement>('a, summary, button')).filter((element) =>
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden' &&
      !element.hasAttribute('disabled')
    );

  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
  if (open) {
    scrollPosition = window.scrollY;
    document.body.style.setProperty('--nav-scroll-offset', `${-scrollPosition}px`);
    document.body.style.setProperty('--nav-body-width', `${document.body.clientWidth}px`);
    document.body.classList.add('nav-open');
    (closeButton ?? focusables()[0])?.focus();
    return;
  }

  unlockBodyScroll();
  const scrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, scrollPosition);
  document.documentElement.style.scrollBehavior = scrollBehavior;
}

function closeMobileMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const wasOpen = Boolean(nav?.classList.contains('open') || document.body.classList.contains('nav-open'));
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  nav?.classList.remove('open');
  unlockBodyScroll();
  if (wasOpen) {
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollPosition);
    document.documentElement.style.scrollBehavior = scrollBehavior;
  }
  setSubmenuOpen(false);
  openedByHover = false;
  clearLeaveTimer();
}

function initMobileMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const closeButton = nav.querySelector<HTMLButtonElement>('.nav-close');
  toggle.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  closeButton?.addEventListener('click', () => {
    setMenuOpen(false);
    toggle.focus({ preventScroll: true });
  });
}

function initSubmenu() {
  const submenu = document.querySelector<HTMLElement>('.site-nav .has-sub');
  const submenuToggle = submenu?.querySelector<HTMLButtonElement>('.consultations-toggle');
  if (!submenu || !submenuToggle) return;

  submenuToggle.addEventListener('click', () => {
    const isOpen = submenuToggle.getAttribute('aria-expanded') === 'true';
    setSubmenuOpen(openedByHover || !isOpen);
    openedByHover = false;
  });
  submenu.addEventListener('pointerenter', () => {
    clearLeaveTimer();
    if (desktopBreakpoint.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      if (!submenu.classList.contains('open')) openedByHover = true;
      setSubmenuOpen(true);
    }
  });
  submenu.addEventListener('pointerleave', () => {
    if (!openedByHover) return;
    clearLeaveTimer();
    leaveTimer = window.setTimeout(() => {
      leaveTimer = undefined;
      if (openedByHover && !submenu.contains(document.activeElement)) setSubmenuOpen(false);
      openedByHover = false;
    }, 150);
  });
  submenu.addEventListener('focusout', (event) => {
    if (!(event.relatedTarget instanceof Node) || !submenu.contains(event.relatedTarget)) {
      clearLeaveTimer();
      setSubmenuOpen(false);
      openedByHover = false;
    }
  });
}

function initMapFacades() {
  document.querySelectorAll<HTMLElement>('.map-facade[data-map-src]').forEach((facade) => {
    const frame = facade.querySelector<HTMLElement>('.map-frame');
    const status = facade.querySelector<HTMLElement>('.map-status');
    if (!frame || !status) return;

    let started = false;
    const loadMap = () => {
      const src = facade.dataset.mapSrc;
      if (started || !src) return;
      started = true;
      status.hidden = true;
      status.textContent = '';
      facade.classList.remove('map-error');

      const iframe = document.createElement('iframe');
      let settled = false;
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        iframe.remove();
        facade.classList.remove('map-loaded');
        facade.classList.add('map-error');
        status.textContent = 'The map could not be loaded. Use the Open in Google Maps link below.';
        status.hidden = false;
      }, 8000);
      iframe.title = facade.dataset.mapTitle ?? '';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      iframe.addEventListener('load', () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        facade.classList.add('map-loaded');
      }, { once: true });
      iframe.addEventListener('error', () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        iframe.remove();
        facade.classList.remove('map-loaded');
        facade.classList.add('map-error');
        status.textContent = 'The map could not be loaded. Use the Open in Google Maps link below.';
        status.hidden = false;
      }, { once: true });
      iframe.src = src;
      frame.append(iframe);
    };

    const IntersectionObserverConstructor = Reflect.get(window, 'IntersectionObserver') as
      | typeof IntersectionObserver
      | undefined;
    if (typeof IntersectionObserverConstructor === 'function') {
      const observer = new IntersectionObserverConstructor((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadMap();
        }
      }, { rootMargin: '300px' });
      observer.observe(frame);
    } else {
      loadMap();
    }
  });
}

function initEnquiryForm() {
  const form = document.querySelector<HTMLFormElement>('form.enquiry-form');
  if (!form) {
    window.__nhcTurnstileSuccess = undefined;
    return;
  }

  const status = form.querySelector<HTMLElement>('[role="alert"]');
  const turnstile = form.querySelector<HTMLElement>('.cf-turnstile');
  let turnstileRequested = false;
  let turnstileSubmitPending = false;
  let loadTurnstile: (() => void) | undefined;
  if (turnstile) {
    turnstile.dataset.callback = '__nhcTurnstileSuccess';
    window.__nhcTurnstileSuccess = (token) => {
      const currentForm = document.querySelector<HTMLFormElement>('form.enquiry-form');
      const currentTurnstile = currentForm?.querySelector<HTMLElement>('.cf-turnstile');
      if (!currentForm || !currentTurnstile) return;
      let response = currentForm.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
      if (!response) {
        response = document.createElement('input');
        response.type = 'hidden';
        response.name = 'cf-turnstile-response';
        currentTurnstile.append(response);
      }
      response.value = token;
      if (turnstileSubmitPending) {
        turnstileSubmitPending = false;
        currentForm.requestSubmit();
      }
    };
    loadTurnstile = () => {
      if (turnstileRequested) return;
      turnstileRequested = true;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.addEventListener('error', () => {
        turnstileRequested = false;
        turnstileSubmitPending = false;
        if (status) status.textContent = 'The spam check could not load. Please try again.';
      }, { once: true });
      document.head.append(script);
    };
  }

  const date = form.querySelector<HTMLInputElement>('input[type="date"]');
  if (date) {
    date.min = new Date().toISOString().slice(0, 10);
    date.addEventListener('change', () => {
      const day = date.value ? new Date(date.value + 'T12:00:00').getDay() : 1;
      date.setCustomValidity(day === 0 || day === 6 ? 'The clinic is open Monday to Friday. Please pick a weekday.' : '');
    });
  }
  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      const firstBad = form.querySelector<HTMLElement>(':invalid');
      if (status) status.textContent = 'Please check the highlighted fields.';
      form.querySelectorAll<HTMLInputElement>('input, select, textarea').forEach((field) => {
        const error = document.getElementById(`${field.id}-error`);
        if (error) error.textContent = field.validity.valid ? '' : field.validationMessage;
        field.setAttribute('aria-invalid', String(!field.validity.valid));
      });
      firstBad?.focus();
      return;
    }

    if (turnstile && !form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value) {
      event.preventDefault();
      turnstileSubmitPending = true;
      loadTurnstile?.();
    }
  });
}

function initPage() {
  document.documentElement.classList.add('js');
  document.querySelectorAll<HTMLAnchorElement>(
    'a[href="/book-appointment/"], a[href^="/book-appointment/thank-you/"]'
  ).forEach((link) => link.setAttribute('data-astro-reload', ''));
  initMobileMenu();
  initSubmenu();
  initMapFacades();
  initEnquiryForm();
}

function showAskAiStatus(status: HTMLElement, message: string) {
  if (askAiStatusTimer !== undefined) window.clearTimeout(askAiStatusTimer);
  status.textContent = message;
  askAiStatusTimer = window.setTimeout(() => {
    status.textContent = '';
    askAiStatusTimer = undefined;
  }, 4000);
}

document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-preparation', closeMobileMenu);
document.addEventListener('astro:before-swap', (event) => {
  clearLeaveTimer();
  const newDocument = (event as Event & { newDocument: Document }).newDocument;
  newDocument.documentElement.classList.add('js');
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const nav = document.getElementById('site-nav');
  const link = target.closest<HTMLAnchorElement>('a');
  if (link && nav?.contains(link) && nav.classList.contains('open')) closeMobileMenu();

  const submenu = document.querySelector<HTMLElement>('.site-nav .has-sub');
  if (submenu?.classList.contains('open') && !submenu.contains(target)) setSubmenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  if (!nav || !toggle) return;
  const submenu = nav.querySelector<HTMLElement>('.has-sub');
  const submenuToggle = submenu?.querySelector<HTMLButtonElement>('.consultations-toggle');
  if (event.key === 'Escape' && submenu?.classList.contains('open')) {
    setSubmenuOpen(false);
    submenuToggle?.focus({ preventScroll: true });
    event.preventDefault();
    return;
  }
  if (!nav.classList.contains('open')) return;
  if (event.key === 'Escape') {
    closeMobileMenu();
    toggle.focus({ preventScroll: true });
  } else if (event.key === 'Tab') {
    const items = Array.from(nav.querySelectorAll<HTMLElement>('a, summary, button')).filter((element) =>
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden' &&
      !element.hasAttribute('disabled')
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!nav.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>('a[data-copy-prompt="true"]');
  if (!link) return;
  const widget = link.closest<HTMLElement>('.ask-ai[data-prompt]');
  const status = widget?.querySelector<HTMLElement>('.ask-ai-status');
  const prompt = widget?.dataset.prompt;
  if (!status || !prompt) return;

  void (async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      showAskAiStatus(status, 'Question copied. Paste it into Gemini.');
    } catch {
      showAskAiStatus(status, 'Unable to copy the question. Please copy it manually.');
    }
  })();
});

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (!BOOKING_MESSAGE_ORIGINS.includes(event.origin)) return;
  if (!event.data || typeof event.data !== 'object' || Array.isArray(event.data)) return;
  const data = event.data as Record<string, unknown>;
  if (data.type !== 'booking_complete') return;

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

desktopBreakpoint.addEventListener('change', () => {
  clearLeaveTimer();
  setSubmenuOpen(false);
  openedByHover = false;
  if (desktopBreakpoint.matches) closeMobileMenu();
});

window.addEventListener('resize', () => {
  if (desktopBreakpoint.matches && document.getElementById('site-nav')?.classList.contains('open')) {
    closeMobileMenu();
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) closeMobileMenu();
});

export {};
