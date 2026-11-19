# Deployment

## Vercel

1. Push this repository to GitHub and import it in Vercel. The framework preset is detected as **Astro**.
2. Build command `npm run build`. Output is handled by the `@astrojs/vercel` adapter.
3. Add the environment variables below (Project → Settings → Environment Variables).
4. Add both domains, `newporthomeopathy.com` and `www.newporthomeopathy.com`. `vercel.json` redirects noncanonical host, protocol and page-path requests to the HTTPS apex URL in one 301.
5. Keep `/book-appointment/` server-rendered so enquiry errors and the no-JavaScript form fallback continue to work. In Project Settings → Functions → Function Region, select London (`lhr1`) to reduce latency for UK visitors.

`vercel.json` also sets:
- **Redirects:** `/index.html` and `/inner-page.html` go to `/`; trailing slashes are added. The sitemap is served directly from `/sitemap.xml`.
- **Security headers:** HSTS, nosniff, Referrer-Policy, Permissions-Policy and a Content-Security-Policy (allows Cloudflare Turnstile, Google Maps and the Setmore, Calendly, Cliniko and Cal.com booking embeds).
- **Caching:** `/_astro/*` and `/fonts/*` cache for 1 year (immutable). Icons and the OG image cache for 1 week.

The booking embed frame policy allows Setmore, Calendly, Cliniko and Cal.com. Remove unused provider origins after the booking tool is chosen.

The old PHP files (`ajax.php`, `assets/forms/*.php`) don't exist in this build, so they return 404.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | To send email | Booking-form emails via [Resend](https://resend.com). Without it, production shows "couldn't send, please call". In `npm run dev` the form still completes but sends nothing. |
| `CLINIC_INBOX` | No | Where enquiries go. Defaults to the clinic email in `site.ts` (info@newporthomeopathy.com). |
| `TURNSTILE_SECRET_KEY` + `PUBLIC_TURNSTILE_SITE_KEY` | Required in production | Cloudflare Turnstile spam check on the form. Local development allows the secret key to be absent. |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Required in production | Upstash Redis REST credentials for the five-per-hour enquiry limit per IP. Local development allows submissions when these are absent. |
| `PUBLIC_BOOKING_INITIAL_URL` | Optional | Cal.com initial-consultation event URL, e.g. `https://cal.com/newport-homeopathy/initial-consultation`. Set this and the follow-up URL to enable booking tabs. |
| `PUBLIC_BOOKING_FOLLOWUP_URL` | Optional | Cal.com follow-up event URL, e.g. `https://cal.com/newport-homeopathy/follow-up-consultation`. |
| `PUBLIC_BOOKING_EMBED_URL` | Legacy fallback | When the new event URLs are unset, this URL is used for both booking tabs. |
| `PUBLIC_BOOKING_EMBED_URL_INITIAL` + `PUBLIC_BOOKING_EMBED_URL_FOLLOWUP` | Legacy fallback | Existing deployments may use these per-event variables instead of the new names. |

A template is in `.env.example`. Copy it to `.env` for local development (`.env` is git-ignored).

## Cal.com booking embed

1. Create the clinic's Cal.com account and configure the consultation event types and availability.
2. Copy the initial and follow-up event URLs:
   - `https://cal.com/newport-homeopathy/initial-consultation`
   - `https://cal.com/newport-homeopathy/follow-up-consultation`
3. Set `PUBLIC_BOOKING_INITIAL_URL` and `PUBLIC_BOOKING_FOLLOWUP_URL` in Vercel's Environment Variables for the environments where bookings should be enabled. For local testing, add them to `.env`.
4. Redeploy after changing the variables. The Book page shows tabs for both events when both URLs are set, with the enquiry form below the booking flow.

For each event, set **Event type > Advanced > Redirect on booking** to the same-origin thank-you page:

- Initial event: `https://newporthomeopathy.com/book-appointment/thank-you/?source=booking&type=initial`
- Follow-up event: `https://newporthomeopathy.com/book-appointment/thank-you/?source=booking&type=follow_up`

Existing deployments can continue to use `PUBLIC_BOOKING_EMBED_URL_INITIAL` and `PUBLIC_BOOKING_EMBED_URL_FOLLOWUP`. The legacy `PUBLIC_BOOKING_EMBED_URL` is used as the fallback URL for both tabs.

## Email sending (Resend)

1. Create a Resend account and add the domain `newporthomeopathy.com`.
2. Add the DNS records Resend gives you (SPF, DKIM), plus a DMARC record. Start with `v=DMARC1; p=none; rua=mailto:info@newporthomeopathy.com` and move to `p=quarantine` after two clean weeks.
3. Emails are sent from `noreply@newporthomeopathy.com` with Reply-To set to the patient. The patient also gets an automatic acknowledgement.

## After launch

- **Google Search Console:** verify the domain by DNS TXT record, submit `https://newporthomeopathy.com/sitemap.xml`, and request indexing of the home page.
- **Bing Webmaster Tools:** import the property from Search Console.
- **Google Business Profile:** the name, address and phone must match the site exactly. Website link: `https://newporthomeopathy.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- **Validate:** run the Schema Markup Validator and the Rich Results Test on the live URLs. Run Lighthouse on mobile for Home, a consultation page, Book and a blog post. Aim for 90+ in all categories.

Full status of every requirement: [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Redirect and sitemap verification

After deployment, each noncanonical URL below should return one 301 to the HTTPS apex URL with a trailing slash. The `--max-redirs 1` command fails if the request needs more than one redirect. The canonical URL and sitemap should return 200 without redirecting.

```sh
curl -I http://newporthomeopathy.com/about-kavita-batchu
curl -I https://www.newporthomeopathy.com/about-kavita-batchu
curl -I -L --max-redirs 1 http://www.newporthomeopathy.com/about-kavita-batchu
curl -I https://newporthomeopathy.com/about-kavita-batchu/
curl -I https://newporthomeopathy.com/sitemap.xml
```
