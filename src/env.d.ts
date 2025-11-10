/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Site Configuration
  readonly SITE_URL?: string
  readonly SITE_TITLE?: string
  readonly SITE_DESCRIPTION?: string
  readonly SITE_AUTHOR?: string

  // Giscus Comments
  readonly GISCUS_REPO?: string
  readonly GISCUS_REPO_ID?: string
  readonly GISCUS_CATEGORY?: string
  readonly GISCUS_CATEGORY_ID?: string
  readonly GISCUS_MAPPING?:
    | 'pathname'
    | 'url'
    | 'title'
    | 'og:title'
    | 'specific'
  readonly GISCUS_THEME?: string
  readonly GISCUS_LANG?: string
  readonly GISCUS_REACTIONS_ENABLED?: '0' | '1'
  readonly GISCUS_EMIT_METADATA?: '0' | '1'
  readonly GISCUS_INPUT_POSITION?: 'top' | 'bottom'
  readonly GISCUS_LOADING?: 'lazy' | 'eager'
  readonly GISCUS_STRICT?: '0' | '1'
  readonly GISCUS_ENABLED?: string

  // Social Links
  readonly GITHUB_URL?: string
  readonly EMAIL_ADDRESS?: string
  readonly PATREON_URL?: string
  readonly KOFI_URL?: string

  // Repository
  readonly REPOSITORY_NAME?: string
  readonly REPOSITORY_OWNER?: string

  // Build
  readonly NODE_ENV?: 'development' | 'production'
  readonly ENABLE_ANALYTICS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
