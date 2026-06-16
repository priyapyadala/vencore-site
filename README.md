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
| Team / timeline | `src/data/team.json` |
| Nav / mega menu | `src/data/navigation.json` |
| Images | `public/images/` (logo is a manual asset; run `npm run generate:images` for reference placeholders) |

## Contact form

Copy `.env.example` to `.env` and set `PUBLIC_WEB3FORMS_KEY` for online form submission. Without it, the form falls back to mailto.

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
