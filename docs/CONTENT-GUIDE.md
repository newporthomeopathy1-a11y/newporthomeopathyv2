# Content guide

How to change what the website says. After any change, run `npm run build`. It fails if wording breaks the copy rules below.

## 1. Clinic details, fees, hours, services, FAQs: `src/data/site.ts`

Everything repeated across pages lives in this one file, so it can't drift out of sync. That includes the header, footer, contact page, fees table, structured data for Google, the FAQ page and the FAQ preview.

| To change | Edit in `site.ts` |
|---|---|
| Phone, WhatsApp, email, address, hours, payment methods | `clinic` |
| Fees and durations (incl. the free chat) | `fees` |
| The four service cards on the home page | `services` |
| Menu items | `nav` |
| FAQ questions and answers | `faqs` (each can link to a page) |
| Towns on "Areas we serve" | `areas` |
| Patient reviews (section appears automatically when not empty) | `reviews`, `googleReviewUrl` |
| Facebook / Instagram (icons appear automatically when set) | `clinic.social`, `clinic.sameAs` |
| GP statement | `gpStatement`, `gpStatementShort` |

Current clinic email: **cavitasuresh@yahoo.com**. It's shown on the site and also receives booking-form enquiries.

## 2. Page text: `src/pages/*.astro`

Each page starts with a `<Base title="…" description="…">` block:
- **title:** 60 characters or fewer, unique per page.
- **description:** 155 characters or fewer, unique per page.
- Each page has exactly one `<h1>` (set through `PageIntro` on inner pages), followed by a one- or two-sentence summary that gives the key facts first.

## 3. Blog posts: `src/content/blog/<slug>.md`

```markdown
---
title: "Your First Homeopathy Consultation: A Simple Guide"   # ≤ 60 chars
description: "What happens at a first consultation…"               # ≤ 155 chars
published: 2026-11-12
updated: 2026-12-01        # optional
draft: false               # true hides the post
---
Post body in Markdown. Link to at least one service page and to /book-appointment/.
```
The file name becomes the URL: `first-homeopathy-consultation-guide.md` becomes `/blog/first-homeopathy-consultation-guide/`.

## 4. Images

| Image | File | Recommended source size |
|---|---|---|
| Home hero background | `src/assets/hero-remedies.jpg` | ≥ 1600 px wide, landscape |
| About photo (home + About page) | `src/assets/cavita-about.jpg` | ≥ 1448 × 1086 (4:3) |
| Portrait (blog author) | `src/assets/cavita-portrait.jpg` | ≥ 1200 × 1500 (4:5) |
| Logo | `src/assets/logo.png` | Transparent PNG ≥ 1000 px wide (or SVG) |

Replace a file with the same name and run `npm run build`. Astro creates AVIF and WebP versions in several sizes automatically.
After changing the logo, run `node scripts/make-logo.mjs` to regenerate its responsive variants and structured-data image. Run `npm run icons` after changing the logo or portrait to rebuild the favicons and social preview image.

## 5. Copy rules (UK ASA / CAP Code): must follow

- ❌ Don't name conditions or symptoms (asthma, eczema, migraine, anxiety, allergies…) anywhere: text, headings, alt text, URLs, meta tags, structured data.
- ❌ Don't use "treat", "treatment for", "cure", "heal", "relief", "effective", "safe", "no side effects" or "natural remedy for…" about homeopathy.
- ❌ No "Dr" before the practitioner's name.
- ✅ Describe the service: who, where, how long, how much, how to book.
- ✅ Reviews may describe the experience only (listening, professionalism, convenience), never results.
- ✅ Keep the GP statement on Home, both consultation pages, FAQs and in the footer.
