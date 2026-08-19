# Fonts

Reading typefaces are self-hosted from `@fontsource-variable/*` and `@fontsource/atkinson-hyperlegible` (OFL). They are imported in `src/components/FontStyles.astro` — no Google Fonts CDN.

The default look is **Fraunces** for titles, **Literata** for prose, and **Bricolage Grotesque** for UI.

Geist Mono stays in this folder for code blocks.

```text
fonts/
└── geist/
    └── geist-mono.woff2
```

Site-wide appearance is one `html[data-preset]` look. Pairings live in `src/lib/appearance.ts`.
