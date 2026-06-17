# CLAUDE.md — Vencore Design Co. Website

Astro 6 static site. Read this first; avoid re-exploring the tree.

## Stack
- Astro + TypeScript, content collections (`src/content.config.ts`)
- Styles: plain CSS files in `src/styles/` (no Tailwind)
- Images: `public/images/` + `vencore_images/` (synced via scripts)

## Structure
- `src/pages/` — routes (index, about, contact, careers, services/[slug], projects/[slug], insights/[slug], etc.)
- `src/content/{services,projects,insights}/*.json|md` — editable content (see README content table)
- `src/data/*.json` — site-wide data: navigation, team, company, careers, process
- `src/components/*.astro` — shared UI (Nav, Footer, PageHero, ImageGallery, CTABand, etc.)
- `src/layouts/BaseLayout.astro` — page shell
- `src/lib/` — helpers (images, content, format, stagger, insight-markdown)
- `scripts/` — image validation/generation/sync, lighthouse CI
- `tests/` — Playwright smoke tests

## Commands
```bash
npm run dev
npm run build        # runs validate-project-images + sync-images first
npm run check         # astro check (types)
npm run validate:images
npm run test:smoke
```

## Conventions / gotchas
- New project case study → `src/content/projects/{slug}.json`; run `npm run validate:images` for unique gallery images.
- `featuredRank` controls homepage mosaic order.
- Quality gate before commit: `npm run validate:images && npm run build && npm run check`.
- Don't hand-edit `dist/` (build output) or `.astro/` (generated).

## Token-efficiency notes for agents
- Don't `find`/`grep` across `node_modules`, `dist`, `.astro`, `vencore_images` — exclude them.
- Content edits are usually data-file edits, not component edits — check `src/content/` and `src/data/` before touching `.astro` components.
