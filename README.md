# Astro Sumi

A git-native template for serial novels: markdown in the repo, a reading chamber on the web, and a Codex beside the books.

> Catalog: [ItamiForge](https://itamiforge.github.io/itamiforge/docs/projects/#astro-sumi)

Fork it, replace the sample stories, and host your own.

## What you get

* Novels → volumes → chapters, drafts, RSS, sitemap
* Reading settings (named look presets plus spoiler mode), continue-reading with scroll restore, immersive mode
* Codex: people, places, factions, kindreds, glossary, annals, library, relics
* Atlas plates with spoiler-aware pins
* `[[wiki]]` links in prose, hover cards, backlinks
* Epic callouts (`> [!PROPHECY]`) and scholar footnotes
* Sveltia CMS at `/admin/` (git markdown, no server)
* `bun run fresh` to wipe sample books and lore

## Quick start

```bash
git clone https://github.com/your-username/astro-sumi.git my-novel-site
cd my-novel-site
bun install
bun run setup
bun run dev
```

Or copy `.env.example` to `.env.local` and edit it.

To start from empty shelves (keeps `src/content/authors/template-author.md`):

```bash
bun run fresh -- --yes
```

## Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run preview` | Preview the build |
| `bun run setup` | Interactive `.env.local` |
| `bun run fresh` | Delete sample content |
| `bun run verify` | Format, lint, tests, types, security — same gate as CI and pre-push |
| `bun run test:run` | Tests once |
| `bun run prettier` | Format code |
| `bun run lint` | JS, CSS, and markdown lint |

## Docs

* [Guide](docs/guide.md) — content model, wiki links, reading, CMS
* [Setup](docs/setup.md) — environment and first run
* [Comments](docs/giscus.md) — Giscus on chapter pages

## Stack

Astro 5, Bun, Tailwind CSS 4, shadcn/ui, TypeScript, Vitest.

## License

MIT. Based on [astro-erudite](https://github.com/jktrn/astro-erudite) by [jktrn](https://github.com/jktrn).
