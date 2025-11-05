/**
 * TypeScript interfaces for comment system configuration
 */

/**
 * Giscus configuration interface
 */
export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific'
  theme: string
  lang: string
  reactionsEnabled: '0' | '1'
  emitMetadata: '0' | '1'
  inputPosition: 'top' | 'bottom'
  loading: 'lazy' | 'eager'
  strict: '0' | '1'
  enabled: boolean
}

/**
 * Per-novel comment configuration
 */
export interface NovelCommentConfig {
  enabled: boolean
  customCategory?: string
  customTheme?: string
  customMapping?: GiscusConfig['mapping']
}

/**
 * Chapter comment configuration
 */
export interface ChapterCommentConfig {
  enabled: boolean
  customCategory?: string
  customTheme?: string
}

/**
 * Theme synchronization options
 */
export interface ThemeConfig {
  syncWithSiteTheme: boolean
  lightTheme: string
  darkTheme: string
  defaultTheme: string
}