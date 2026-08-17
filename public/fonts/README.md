# Fonts

Reading typefaces are self-hosted from `@fontsource-variable/*` and `@fontsource/atkinson-hyperlegible` (OFL). They are imported in `src/components/FontStyles.astro` — no Google Fonts CDN.

Geist Mono stays in this folder for code blocks.

```text
fonts/
└── geist/
    └── geist-mono.woff2
```

Site-wide appearance is `html[data-palette]` plus `html[data-type]`. Pairings live in `src/lib/appearance.ts`.
