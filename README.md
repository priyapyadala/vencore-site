# Vencore Design Co. — Website

Premium multi-page site built with [Astro](https://astro.build).

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output → dist/
npm run preview  # preview production build
```

## Content editing

| Update | File |
|--------|------|
| Service copy / concept images | `src/content/services/{slug}.json` |
| Project case study | `src/content/projects/{slug}.json` |
| Blog post | `src/content/insights/{slug}.md` |
| Team / timeline / company copy | `src/data/team.json`, `src/data/company.json` |
| Nav / mega menu | `src/data/navigation.json` |
| Images | `public/images/` (logo is a manual asset; run `npm run generate:images` for reference placeholders) |

## Contact form

Copy `.env.example` to `.env` and set `PUBLIC_WEB3FORMS_KEY` for online form submission. Without it, the form falls back to mailto.

Optional: set `PUBLIC_GA_MEASUREMENT_ID` for GA4 conversion events (form submit, WhatsApp, phone, project views).

## Content checklist for new projects

When adding a case study at `src/content/projects/{slug}.json`:

1. **Unique gallery** — assign 8–10 image paths from the category pool; run `npm run validate:images` to confirm zero cross-project duplicates.
2. **Featured rank** — set `featuredRank` (1 = homepage mosaic lead) if the project should surface on the home page.
3. **Case study depth** — fill `brief`, `approach`, `materials`, `outcome`, and optional `processStrip` (3 steps: Concept → Site → Finish).
4. **Social proof** — add `testimonial` with `{ quote, name, role, attribution }` (use `first-name-role` unless client approves full name).
5. **Related work** — set `relatedProjectSlugs` to 2–3 same-category projects for the case study footer.
6. **Client review** — mark draft copy in your PR; production names and quotes need client sign-off before launch.

Future upgrade: per-project folders in `vencore_images/projects/{slug}/` (see `npm run sync:images`).

## Quality gates

```bash
npm run validate:images && npm run build && npm run check
npm run test:smoke          # Playwright smoke (starts preview automatically)
npm run lighthouse          # Requires preview on :4321 — see script header
```

### Lighthouse baseline vs target

| Page | Baseline (local) | Target |
|------|------------------|--------|
| Home `/` | ~75 perf / 100 a11y | Perf 90+, A11y 95+, SEO 100 |
| Contact `/contact/` | ~87 perf / 100 a11y | Perf 90+, A11y 95+, SEO 100 |
| Projects `/projects/` | ~82 perf / 100 a11y | Perf 90+, A11y 95+, SEO 100 |

Re-run `npm run lighthouse` after performance batches (self-hosted fonts, hero video) to compare.

## Hero video (optional)

Place a loop at `public/video/hero-loop.webm` (≤3MB). Desktop-only; poster fallback uses the hero image until the file exists. Disabled on mobile and `prefers-reduced-motion`.

## Self-hosted fonts

Cormorant and Outfit ship from `public/fonts/` (no Google Fonts CDN). Regenerate subsets from `@fontsource/cormorant` and `@fontsource/outfit` if weights change.

## Images

Real photography lives in `vencore_images/`. Sync into the site with:

```bash
npm run sync:images
```

Place the logo manually at `public/images/logo.png`. Reference placeholders (if needed):

```bash
npm run generate:images
```

Do not run `generate:images` after syncing real photos — it will overwrite placeholders only, not the logo.

## Structure

- **Home** — cinematic hero, services teaser, CTA
- **Services** — mega menu with hover preview + 6 category pages
- **Projects** — filterable grid + case study pages
- **About** — legacy timeline + leadership
- **Insights** — blog articles
- **Careers** — open roles
- **Contact** — WhatsApp, map, enquiry form
