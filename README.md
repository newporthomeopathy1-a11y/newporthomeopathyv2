# Newport Homeopathy Clinic: website (version 3)

The website for **Newport Homeopathy Clinic**, 75 Forton Road, Newport, Shropshire TF10 8BU.
It's a fast, static [Astro](https://astro.build) site with one server route for the booking form, deployed on Vercel.

| | |
|---|---|
| Version | **3.0.0**. See [CHANGELOG.md](CHANGELOG.md) |
| Live domain | https://newporthomeopathy.com |
| Framework | Astro 5 (static pages + one serverless route) |
| Hosting | Vercel (`@astrojs/vercel` adapter) |
| Font | Open Sans, self-hosted (variable woff2, latin subset) |
| Node | 18.20.8 or newer (20 LTS recommended) |

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321 — the booking form works locally too
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build to `.vercel/output/`, then runs the copy-compliance check |
| `npm run check` | TypeScript / Astro type check (must report 0 errors) |
| `npm run check:copy` | Re-run the copy-compliance check on the last build |
| `npm run icons` | Regenerate favicons, app icons and `og-image.jpg` from the logo and portrait |

To preview the production build locally, serve the static output: `python3 -m http.server 8090 --directory .vercel/output/static`

---

## Project structure

```
.
├── astro.config.mjs        Site URL, Vercel adapter, sitemap
├── vercel.json             Redirects (www, old URLs), security + cache headers
├── tsconfig.json           Strict TypeScript
├── docs/
│   ├── CONTENT-GUIDE.md     How to edit text, fees, FAQs, blog posts, images (+ copy rules)
│   ├── DEPLOYMENT.md        Vercel, environment variables, DNS, email, Search Console
│   └── LAUNCH-CHECKLIST.md  Every spec item → done / needs clinic input / at launch
├── public/                 Served as-is
│   ├── fonts/              open-sans-latin.woff2
│   ├── assets/img/         logo.png, kavita-batchu.jpg (referenced by structured data)
│   ├── favicon.ico, icon.svg, icon-192/512.png, apple-touch-icon.png, site.webmanifest
│   ├── og-image.jpg        1200×630 social preview
│   ├── robots.txt, llms.txt
├── scripts/
│   ├── check-copy.mjs      Build gate: banned health claims, condition names, template leftovers
│   ├── make-logo.mjs       Generates responsive AVIF/WebP logo variants
│   └── make-icons.mjs      Generates icons + OG image
└── src/
    ├── data/
    │   ├── site.ts          ★ Single source of truth: name, address, phone, email, fees,
    │   │                      hours, services, FAQs, areas, nav, reviews
    │   └── schema.ts        JSON-LD builders (business, person, service, FAQ, breadcrumbs, blog)
    ├── layouts/Base.astro   <head> metadata, header, footer, mobile action bar, cookie banner
    ├── components/          Breadcrumbs, CtaBlock, FaqList, GpStatement, Icon, MapFacade,
    │                        PageIntro, Reviews, ServiceCards
    ├── pages/               One file per URL (see "Pages" below)
    │   └── api/enquiry.ts   POST handler for the booking form (server-rendered)
    ├── content/blog/        Blog posts in Markdown
    ├── content.config.ts    Blog post schema (title ≤ 60, description ≤ 155)
    ├── assets/              Images optimised at build time (hero, about photo, portrait, logo)
    ├── scripts/site.ts      Small client script: menu, consent + GA4, click tracking, map, form hints
    └── styles/global.css    The only stylesheet (design tokens at the top)
```

### Pages

| URL | File |
|---|---|
| `/` | `pages/index.astro` |
| `/homeopathy-consultations/` | `pages/homeopathy-consultations.astro` |
| `/online-homeopathy-consultation/` | `pages/online-homeopathy-consultation.astro` |
| `/consultation-fees/` | `pages/consultation-fees.astro` |
| `/what-to-expect/` | `pages/what-to-expect.astro` |
| `/about-kavita-batchu/` | `pages/about-kavita-batchu.astro` |
| `/areas-we-serve/` | `pages/areas-we-serve.astro` |
| `/frequently-asked-questions/` | `pages/frequently-asked-questions.astro` |
| `/blog/`, `/blog/<slug>/` | `pages/blog/index.astro`, `pages/blog/[slug].astro` |
| `/book-appointment/` | `pages/book-appointment/index.astro` (server-rendered so form errors show without JS) |
| `/book-appointment/thank-you/` | `pages/book-appointment/thank-you/index.astro` (noindex) |
| `/contact/` | `pages/contact.astro` |
| `/privacy-policy/`, `/cookie-policy/`, `/booking-terms/` | policy pages |
| 404 | `pages/404.astro` |

---

## Design system

Defined as CSS custom properties at the top of `src/styles/global.css`.

- **Colours: blue, black, greys and white only.** `--blue-600` (#0b6bcb) for primary buttons and links, `--blue-700` for hover. Lighter blues (`--blue-200/100/50`) for borders, icon tiles and soft fills. Neutrals from `--black` to `--grey-50`. Don't add other hues; the logo and photos are the only coloured elements.
- **Shape:** pill buttons (`--pill`), 16px rounded cards (`--radius`).
- **Type:** Open Sans 400 / 600 / 700, with a metric-matched Arial fallback so there's no layout shift.
- **Icons:** inline SVG in `components/Icon.astro` (no icon font).

---

## Performance

Measured on the production build:

| | Result | Spec target |
|---|---|---|
| Largest Contentful Paint (local) | ~0.12 s | ≤ 2.5 s |
| Cumulative Layout Shift | 0.0001 | ≤ 0.1 |
| Requests on home page | 5 | — |
| Home HTML (compressed) | ~13 KB | — |
| Home above-the-fold total, mobile | ~110 KB | ≤ 1 MB |
| JavaScript | ~3 KB, inlined | ≤ 100 KB |

How:
- CSS and the small script are inlined (no render-blocking requests).
- The font is preloaded. The hero image (LCP) is preloaded as AVIF with `fetchpriority="high"`.
- Every image is resized at build time to AVIF and WebP in several widths. Below-the-fold images lazy-load.
- Google Maps loads only when clicked, and analytics loads only after cookie consent.
- Hashed assets are cached for a year, and the font is cached long-term (`vercel.json`).

`npm run dev` is slower than the live site because images are processed on demand. Always judge speed on a production build.

---

## Compliance (important)

UK advertising rules for homeopathy (ASA / CAP Code) apply to every page, alt text, meta tag and structured data:

- Never name medical conditions or symptoms as things homeopathy helps with.
- Never use "treat", "cure", "heal", "effective", "relief", "safe" or "no side effects" about homeopathy.
- No "Dr" title for the practitioner. Reviews may describe the experience only.
- The GP statement (`gpStatement` in `site.ts`) stays on Home, the consultation pages, FAQs and the footer.

`npm run build` **fails** if banned words, condition names or template leftovers appear in the output (`scripts/check-copy.mjs`).

---

## Further docs

- **Editing content:** [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)
- **Deploying and environment variables:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Launch status of every requirement:** [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md)

Placeholders still waiting on the clinic are marked in code with `TODO(open item N)`. Find them with:
```bash
grep -rn "TODO(open item" src
```
