# Setup

1. `bun install`
2. `bun run setup` (writes `.env.local`) or `cp .env.example .env.local`
3. `bun run dev`

Optional: `bun run fresh` to delete the sample books and Codex files before you add your own.

## Environment

```bash
SITE_TITLE="Your Novel Site"
SITE_AUTHOR="Your Name"
SITE_URL="https://your-domain.com"
GITHUB_URL="https://github.com/yourusername"
EMAIL_ADDRESS="your@email.com"
```

Comments: see [giscus.md](giscus.md). CMS: set `backend.repo` in `public/admin/config.yml`.

## First content

Add a novel in `src/content/novels/` and chapters in `src/content/chapters/` named `novel-slug-v1-c1.md`. Author slug on the novel must match a file in `src/content/authors/`.

## Deploy

Build command: `bun run build`. Output: `dist/`. Set `SITE_URL` (and Giscus values if you use comments) on the host.
