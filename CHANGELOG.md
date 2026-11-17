# Changelog

## Version 3.1.0

- Added page-specific sitemap dates, crawler guidance, generated `llms.txt` and expanded structured data.
- Updated page metadata and clinic information, and tightened the rendered-copy compliance checks.
- Added review dates, grouped FAQs, blog summaries and WhatsApp service-card tracking.

## Version 3.0.5

- Book page now shows Cal.com only; the enquiry form appears only as a fallback when Cal.com URLs are not configured. Free discovery chat now links to WhatsApp.

## Version 3.0.4

- Removed the Home FAQPage schema so structured data matches the visible page.
- Added metadata length checks and updated the Book page metadata.
- Displayed the enquiry form below the Cal.com booking flow and wired booking confirmations through the same-origin redirect.
- Removed draft markers from rendered policy and contact content; added a build check for template leftovers.
- Updated launch and deployment documentation for the booking and schema changes.

## Version 3.0.3 (16 November 2026)

- Simplified the Consultations dropdown to compact, title-only options.
- Aligned the desktop hero actions in one row and left-aligned the About link.
- Removed the Free discovery chat card and FAQ preview from the home page.

## Version 3.0.2 (16 November 2026)

- Map uses a click-to-load "View map" button on Home, Contact and In-person consultations pages.

## Version 3.0.1 (16 November 2026)

- Fixed mobile page-bottom clearance so the cookie banner does not cover footer links or the final content above the sticky action bar.

## Version 3.0.0 (12 November 2026)

- New photo of Kavita Batchu in the "Meet your homeopath" section on the home page and on the About page. It replaces the earlier banner.

## Version 2.0.0 (12 November 2026)

A complete rebuild of newporthomeopathy.com, replacing the version 1 template site.

**Site**
- New static site built with Astro and deployed on Vercel, replacing the Medilab Bootstrap / PHP template.
- 16 pages: Home, Services, In-person and Online consultations, Fees, What to expect, About, Areas we serve, FAQs, Blog, Book, Contact, Privacy, Cookies, Booking terms, plus a thank-you page and a 404 page.
- Rounded, minimal design in Open Sans. Colours are limited to blue, black, greys and white.
- New logo, studio portrait and banner, and a full-cover hero photo.

**Bookings and leads**
- Book, Call and WhatsApp on every page, with a sticky action bar on mobile.
- Working enquiry form with server-side validation, spam protection and an automatic acknowledgement email. It also works without JavaScript.
- Free 15-minute discovery chat added as a service.
- Clinic email: cavitasuresh@yahoo.com.

**Search and AI visibility**
- A unique title, description and H1 on every page. Canonical URLs, Open Graph and Twitter tags.
- Structured data: business, person, services and offers, FAQs, breadcrumbs, blog posts.
- `robots.txt` (AI search crawlers allowed), XML sitemap and `llms.txt`.
- Redirects from www and the old URLs, plus security and caching headers.

**Compliance**
- All copy rewritten to the UK ASA / CAP rules for homeopathy: no condition lists and no treatment or safety claims. The GP statement is on the key pages.
- The build fails automatically if banned wording appears.

**Performance**
- About 110 KB to first view on mobile, with no layout shift. Images are converted to AVIF and WebP, and CSS and JavaScript are inlined.

**Docs**
- README, `docs/CONTENT-GUIDE.md`, `docs/DEPLOYMENT.md` and `docs/LAUNCH-CHECKLIST.md`.

## Version 1 (2021–2025)

The original site: a single-page Medilab Bootstrap template with PHP forms.
