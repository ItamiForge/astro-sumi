# Guide

Astro Sumi is a static novel-site template. Canon lives in markdown under `src/content/`. The public site is generated at build time.

## Content

| Folder                    | Route                             |
| ------------------------- | --------------------------------- |
| `src/content/novels/`     | `/novels/:id`                     |
| `src/content/chapters/`   | `/novels/:novel/:volume/:chapter` |
| `src/content/authors/`    | `/authors/:id`                    |
| `src/content/characters/` | `/codex/people/:id`               |
| `src/content/locations/`  | `/codex/places/:id`               |
| `src/content/factions/`   | `/codex/factions/:id`             |
| `src/content/species/`    | `/codex/kindreds/:id`             |
| `src/content/maps/`       | `/codex/atlas/:id`                |
| `src/content/terms/`      | `/codex/glossary/:id`             |
| `src/content/events/`     | `/codex/annals/:id`               |
| `src/content/documents/`  | `/codex/library/:id`              |
| `src/content/relics/`     | `/codex/relics/:id`               |

Filename slug is the id (`kael.md` → `kael`). Set `draft: true` to keep a file out of production. Codex entities also take `visibility`: `public`, `spoiler` (hidden on indexes until Scholar mode), or `secret` (never built). `shortBio` is the card text and should stay spoiler-safe.

Chapter files use `novel-slug-v1-c1.md`:

```yaml
---
title: 'Chapter Title'
novel: 'novel-slug'
volume: 1
volumeTitle: 'The Age of Bronze'
chapter: 1
publishDate: 2024-01-01
draft: false
---
```

### Wiki links

```md
[[Kael]]
[[character:lyssa|the healer]]
[[location:thornhaven]]
[[term:the-bond]]
[[event:the-first-awakening]]
[[document:prophecy-of-the-five]]
[[relic:kaels-spear]]
```

Kinds: `character` (people), `location` (places), `faction`, `species` (kindreds), `term` (glossary), `event` (annals), `document` (library), `relic`. Unqualified `[[slug]]` resolves if the slug is unique. Every folio lists backlinks from chapters and other Codex files.

### Maps

Pin a place on a plate with percentages from the top-left:

```yaml
coords:
  map: 'thornhaven-valley'
  x: 44
  y: 62
```

### Callouts and footnotes

```md
> [!PROPHECY]
> Five names will wake in a valley that thinks itself small.

A scholar note.[^1]

[^1]: Footnotes open in the side panel on chapter pages.
```

Alert kinds: `NOTE`, `TIP`, `WARNING`, `IMPORTANT`, `PROPHECY`, `CODEX`, `SONG`, `LOG`, `TRANSLATION`, `FORBIDDEN`.

## Reading

The header gear stores one look preset (color, type, and shape together) plus spoiler mode (`first-time` / `scholar`). Immersive chrome is still the `i` key. Opening a chapter writes a continue-reading pointer, including scroll position.

Comfort presets (eyes and access): **Daylight**, **Dusk** (warm night),
**Clear** (high-contrast light), **Beacon** (high-contrast night).
Story presets: **Manuscript** (Fraunces titles, Literata prose; default),
**Myth** (fantasy), **Starfarer** (science fiction), **Nocturne** (horror),
**Lantern** (YA, fairy tale, anime), **Broadsheet** (pulp, comics, serials).
Each look sets color, fonts, type size, measure, and corners together.

Keys: `j` / `k` next and previous chapter, `m` atlas, `i` immersive, `?` help, `Esc` close overlays.

## CMS

`/admin/` is [Sveltia CMS](https://github.com/sveltia/sveltia-cms). It edits the same markdown files. No extra CSS or module script — the CDN bundle is enough.

1. Edit `public/admin/config.yml`: set `backend.repo` to `your-github-user/your-repo`.
2. For a hosted GitHub backend, create a GitHub OAuth application (or use Sveltia’s local folder picker in Chromium).
3. Open `/admin/` in development, or `/astro-sumi/admin/` on GitHub Pages.

Cover images and portraits still use Astro’s `image()` fields in frontmatter. Put those files in the repo and set the path in markdown; the CMS does not rewrite image metadata.

Uploads configured in `config.yml` land in `public/static/uploads/`. If the site uses a `base` path (`/astro-sumi`), prefix public image URLs accordingly.

## Wipe samples

```bash
bun run fresh          # asks first
bun run fresh -- --yes
```

Deletes sample novels, chapters, and Codex markdown. Keeps `src/content/authors/template-author.md` and empty folders with `.gitkeep`.

## Configuration

Copy `.env.example` to `.env.local`. `SITE_TITLE`, `SITE_URL`, and optional `GISCUS_*` / social URLs are the usual knobs. `src/consts.ts` holds nav and featured counts.

Production GitHub Pages uses `base: /astro-sumi`. Internal links go through `withBase()`.

## Deploy

```bash
bun run build
```

Output: `dist/`. Works on GitHub Pages, Vercel, Netlify, Cloudflare Pages. Set `SITE_URL` on the host.
