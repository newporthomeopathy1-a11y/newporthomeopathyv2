# Launch checklist: every spec item and its status

Source: *Newport Homeopathy Clinic, Developer technical specification* v1.0 (12 Nov 2026).
Legend: ✅ done in code · 🟡 needs clinic input (placeholder marked `TODO(open item N)`) · ⬜ needs doing at launch (accounts, DNS, testing on production)

## Part 1–2: Remove old template, fix markup
| Item | Status |
|---|---|
| All Medilab/Uthra/Lorem leftovers, hidden sections, broken forms, preloader, unused vendor files | ✅ Rebuilt from scratch; none carried over. `npm run build` greps for leftovers |
| `lang="en-GB"`, unique titles/descriptions, no meta keywords | ✅ |
| Favicon set from the leaf mark (ico, svg, 180, 192, 512, manifest) | ✅ `scripts/make-icons.mjs` · 🟡 replace with SVG logo when supplied (open item 13) |
| One font family, ≤3 weights, self-hosted woff2, `font-display: swap` | ✅ Open Sans (variable, latin, 48 KB), weights 400/600/700, preloaded, metric-matched fallback |
| Only needed CSS/JS | ✅ No Bootstrap, no icon font, one small deferred script |
| `tel:`, `mailto:`, WhatsApp links | ✅ Email: info@newporthomeopathy.com (clinic's choice; also receives form enquiries) |
| Social icons with real URLs or removed | ✅ Hidden until URLs are set in `src/data/site.ts` · 🟡 open item 11 |
| Logo links to `/` with alt, width, height | ✅ |
| Nav links not wrapped in headings; menu toggle is a `<button>` | ✅ |
| H1 on every page, semantic headings, 16–18px body text | ✅ (checked: exactly one H1 per page) |
| Map iframe title / static map facade | ✅ Click-to-load map, plain link without JS |
| `<address>` identical on every page | ✅ From one data file |
| Copyright year automatic | ✅ Credit line: "Designed & Developed by Articog Tech LLP" (plain text, no link) |
| `bootstrap.bundle.min.js` 404 | ✅ Gone |

## Part 3: Content and compliance
| Item | Status |
|---|---|
| All non-compliant copy replaced with the spec wording | ✅ |
| No condition names, "treat/cure/heal/effective/safe/side effects", no "Dr" | ✅ Enforced by `scripts/check-copy.mjs` on every build |
| GP statement on Home, both consultation pages, FAQs, footer | ✅ |
| Professional body wording | 🟡 Omitted until confirmed (open item 1) |
| Fees, durations and hours consistent everywhere | ✅ `src/data/site.ts` · 🟡 confirm values (open items 4, 5) |
| Written approval of all copy | 🟡 open item 3 |

## Part 4: Enquiry and booking
| Item | Status |
|---|---|
| Book / Call / WhatsApp on every page | ✅ Header, sticky mobile bar, CTA block at the end of every page |
| Mobile sticky bar (<768px, 56px, safe-area) | ✅ |
| Booking tool embed | ✅ Book page shows Cal.com only; the enquiry form appears only as a fallback when Cal.com URLs are not configured. Free discovery chat now links to WhatsApp. |
| Enquiry form fields, labels, required in text, max lengths, honeypot, consent | ✅ Adds a free discovery chat option and a phone format |
| Works without JavaScript | ✅ Booking page is server-rendered and shows errors returned by the server |
| Server validation, CR/LF stripping, HTML escaping | ✅ `src/pages/api/enquiry.ts` |
| Turnstile | ✅ Both keys required in production; local development allows the secret key to be absent |
| Rate limit 5/IP/hour | ✅ Best effort per instance · ⬜ use Upstash/Vercel KV for a hard limit |
| Send via Resend from noreply@, Reply-To patient, acknowledgement email | ✅ · ⬜ create the Resend account, verify the domain, set `RESEND_API_KEY`, `CLINIC_INBOX` |
| Redirect to `/book-appointment/thank-you/` (noindex) | ✅ |
| No form contents in logs or analytics | ✅ |
| SPF, DKIM, DMARC | ⬜ DNS at launch |
| Privacy policy, cookie policy, booking terms | ✅ Drafts · 🟡 controller details, ICO fee, cancellation policy (open items 4, 16) |

## Part 5: Site architecture
| Item | Status |
|---|---|
| All current pages with the spec URLs, H1s, titles (≤60) and descriptions (≤155) | ✅ Enforced by `npm run check:meta` |
| Header: logo, Home, Consultations dropdown, Fees, About, FAQs, Contact, Book button | ✅ |
| Desktop top bar (phone, WhatsApp, email); `aria-current` | ✅ |
| Footer: NAP, hours, links, policies, GP line, © year | ✅ |
| Homepage section order 1–10 | ✅ Reviews section hidden until approved reviews exist; home FAQ preview intentionally removed at the client's request for minimal content, with no FAQPage schema on Home |
| Answer-first intro, CTA block at the end, breadcrumbs (not on Home) | ✅ |
| Blog template: author box with photo, reviewed-by line, dates, related posts | ✅ |
| Custom 404 | ✅ |
| Internal linking rules | ✅ |
| Real photos | ✅ Studio portrait of Kavita supplied and used (hero, About, blog author, OG image, Person schema) · 🟡 clinic room photos (open item 12) |

## Part 6: Technical SEO
| Item | Status |
|---|---|
| Single-hop 301s: HTTP → HTTPS, www → apex, missing trailing slash, legacy URLs | ✅ `vercel.json` |
| robots.txt with AI search crawlers allowed | ✅ |
| XML sitemap without thank-you/404 | ✅ Direct `/sitemap.xml` with real `<lastmod>` values |
| Canonical, Open Graph, Twitter card, theme-color on every page | ✅ |
| OG image 1200×630 < 200 KB | ✅ Logo + portrait, no stock photo |
| Real 404 status | ✅ (Vercel serves 404.html with 404) |
| HSTS, nosniff, Referrer-Policy, Permissions-Policy, CSP, caching | ✅ `vercel.json` |
| llms.txt | ✅ |
| Search Console + Bing Webmaster, sitemap submitted | ⬜ At launch (open item 10) |

## Part 7: Structured data
| Item | Status |
|---|---|
| HealthAndBeautyBusiness + WebSite on every page; no medical types, no "Dr" | ✅ |
| Person (About), Service + Offer (consultation pages, Fees), BreadcrumbList, FAQPage, BlogPosting | ✅ |
| No placeholder values published | ✅ `sameAs`/`memberOf`/`hasMap` omitted until real |
| Geo coordinates match the GBP pin | 🟡 Confirm (from spec) |
| Schema Validator + Rich Results Test zero errors | ⬜ Run on the deployed URL |

## Part 8: Performance and accessibility
| Item | Status |
|---|---|
| LCP image `<picture>` AVIF/WebP, fetchpriority high | ✅ Portrait |
| Images have width/height/alt, lazy below the fold | ✅ |
| Contrast: links #0b6bcb, muted text #555f6b, no #1E90FF/#33d80a text | ✅ |
| Skip link, landmarks, focus visible, menu focus trap + Esc | ✅ |
| Tap targets ≥44px, reduced motion respected, no carousels | ✅ |
| Lighthouse 90+, CWV, axe, screen reader, 360/768/1024/1440 | ⬜ Run on the deployed URL |

## Part 9: Analytics
| Item | Status |
|---|---|
| GA4 behind Consent Mode v2 banner, Accept/Reject equal | ✅ Set `PUBLIC_GA_ID` to enable |
| Events: click_call, click_whatsapp, click_email, click_book, click_directions, generate_lead | ✅ Delegated `[data-track]` listener; no personal data |
| booking_complete | ✅ Wired through the same-origin Cal.com redirect; add the redirect URL to both event types |
| Key events, internal traffic filter, AI-assistants channel group, UTM links for GBP/social | ⬜ GA4 admin settings at launch |

## Needs clinic input

- Confirm controller details and the ICO fee for the privacy policy.
- Confirm the cancellation policy for the booking terms.

## Open items needed from the clinic (spec table)
1 Professional body · 2 Approved title · 3 Copy approval · 4 Fees, payment, cancellation · 5 Hours · 6 Online platform · 7 Booking tool + inbox · 8 Domain email · 9 www or not · 10 Access (DNS, hosting, GBP, Search Console) · 11 Social URLs · 12 Photos · 13 Logo SVG · 14 Parking/access · 15 Developer credit · 16 ICO fee + controller details.
Also: confirm the free discovery chat (length, phone or WhatsApp) and the area drive times.
