/**
 * Environment Variable Validation Module
 * 
 * Provides type-safe, validated access to environment variables with helpful error messages.
 * All variables are loaded at build time (SSG) and validated during application startup.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface SiteConfig {
  url: string
  title: string
  description: string
  author: string
}

export interface GiscusConfig {
  enabled: boolean
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
}

export interface SocialLinks {
  github?: string
  email?: string
  patreon?: string
  kofi?: string
}

export interface EnvConfig {
  site: SiteConfig
  giscus: GiscusConfig
  social: SocialLinks
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Get a required environment variable with validation
 */
function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please copy .env.example to .env.local and configure your values.\n` +
      `See .env.example for all available configuration options.`
    )
  }
  
  return value
}

/**
 * Get an optional environment variable
 */
function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return import.meta.env[key] || defaultValue
}

/**
 * Validate boolean environment variable (accepts "true"/"false" or "1"/"0")
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key]
  
  if (!value) {
    return defaultValue
  }
  
  const normalized = value.toLowerCase()
  
  if (normalized === 'true' || normalized === '1') {
    return true
  }
  
  if (normalized === 'false' || normalized === '0') {
    return false
  }
  
  throw new Error(
    `Invalid ${key} value: "${value}"\n` +
    `Expected: "true", "false", "1", or "0"`
  )
}

/**
 * Validate binary string environment variable ("0" or "1")
 */
function getBinaryEnv(key: string, defaultValue: '0' | '1' = '0'): '0' | '1' {
  const value = import.meta.env[key]
  
  if (!value) {
    return defaultValue
  }
  
  if (value === '0' || value === '1') {
    return value
  }
  
  throw new Error(
    `Invalid ${key} value: "${value}"\n` +
    `Expected: "0" or "1"`
  )
}

/**
 * Validate enum environment variable
 */
function getEnumEnv<T extends string>(
  key: string,
  validValues: readonly T[],
  defaultValue: T
): T {
  const value = import.meta.env[key]
  
  if (!value) {
    return defaultValue
  }
  
  if (validValues.includes(value as T)) {
    return value as T
  }
  
  throw new Error(
    `Invalid ${key} value: "${value}"\n` +
    `Expected one of: ${validValues.join(', ')}`
  )
}

/**
 * Validate URL format
 */
function validateUrl(url: string, fieldName: string): void {
  try {
    new URL(url)
  } catch {
    throw new Error(
      `Invalid ${fieldName}: "${url}"\n` +
      `Expected a valid URL (e.g., https://example.com)`
    )
  }
}

/**
 * Validate email format (basic check)
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============================================================================
// Site Configuration Validation
// ============================================================================

function validateSiteConfig(): SiteConfig {
  const url = getRequiredEnv('SITE_URL', 'https://your-site.com')
  const title = getRequiredEnv('SITE_TITLE', 'Astro Sumi')
  const description = getRequiredEnv(
    'SITE_DESCRIPTION',
    'A clean, minimal template specifically designed for novel and book writing projects'
  )
  const author = getRequiredEnv('SITE_AUTHOR', 'Your Name')
  
  // Validate URL format
  validateUrl(url, 'SITE_URL')
  
  // Warn if using default values
  if (url === 'https://your-site.com') {
    console.warn(
      'Warning: Using default SITE_URL. Please configure SITE_URL in .env.local'
    )
  }
  
  if (author === 'Your Name') {
    console.warn(
      'Warning: Using default SITE_AUTHOR. Please configure SITE_AUTHOR in .env.local'
    )
  }
  
  return {
    url,
    title,
    description,
    author,
  }
}

// ============================================================================
// Giscus Configuration Validation
// ============================================================================

function validateGiscusConfig(): GiscusConfig {
  const enabled = getBooleanEnv('GISCUS_ENABLED', true)
  
  // If Giscus is disabled, return minimal config with defaults
  if (!enabled) {
    return {
      enabled: false,
      repo: 'your-username/your-repository',
      repoId: 'YOUR_REPO_ID',
      category: 'General',
      categoryId: 'YOUR_CATEGORY_ID',
      mapping: 'pathname',
      theme: 'fro',
      lang: 'en',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'top',
      loading: 'lazy',
      strict: '0',
    }
  }
  
  // If enabled, validate required fields
  const repo = getRequiredEnv('GISCUS_REPO', 'your-username/your-repository')
  const repoId = getRequiredEnv('GISCUS_REPO_ID', 'YOUR_REPO_ID')
  const category = getRequiredEnv('GISCUS_CATEGORY', 'General')
  const categoryId = getRequiredEnv('GISCUS_CATEGORY_ID', 'YOUR_CATEGORY_ID')
  
  // Validate repo format (should be username/repo)
  if (!repo.includes('/')) {
    throw new Error(
      `Invalid GISCUS_REPO format: "${repo}"\n` +
      `Expected format: "username/repository-name"\n` +
      `Get your configuration from https://giscus.app`
    )
  }
  
  // Warn if using default values
  if (repo === 'your-username/your-repository') {
    console.warn(
      'Warning: Using default GISCUS_REPO. Please configure Giscus settings in .env.local\n' +
      'Get your configuration from https://giscus.app'
    )
  }
  
  if (repoId === 'YOUR_REPO_ID' || categoryId === 'YOUR_CATEGORY_ID') {
    console.warn(
      'Warning: Using default Giscus IDs. Please configure Giscus settings in .env.local\n' +
      'Get your configuration from https://giscus.app'
    )
  }
  
  // Optional fields with defaults
  const mapping = getEnumEnv(
    'GISCUS_MAPPING',
    ['pathname', 'url', 'title', 'og:title', 'specific'] as const,
    'pathname'
  )
  const theme = getOptionalEnv('GISCUS_THEME', 'fro') || 'fro'
  const lang = getOptionalEnv('GISCUS_LANG', 'en') || 'en'
  const reactionsEnabled = getBinaryEnv('GISCUS_REACTIONS_ENABLED', '1')
  const emitMetadata = getBinaryEnv('GISCUS_EMIT_METADATA', '0')
  const inputPosition = getEnumEnv(
    'GISCUS_INPUT_POSITION',
    ['top', 'bottom'] as const,
    'top'
  )
  const loading = getEnumEnv(
    'GISCUS_LOADING',
    ['lazy', 'eager'] as const,
    'lazy'
  )
  const strict = getBinaryEnv('GISCUS_STRICT', '0')
  
  return {
    enabled,
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    theme,
    lang,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    loading,
    strict,
  }
}

// ============================================================================
// Social Links Validation
// ============================================================================

function validateSocialLinks(): SocialLinks {
  const github = getOptionalEnv('GITHUB_URL')
  const email = getOptionalEnv('EMAIL_ADDRESS')
  const patreon = getOptionalEnv('PATREON_URL')
  const kofi = getOptionalEnv('KOFI_URL')
  
  // Validate URLs if provided
  if (github) {
    validateUrl(github, 'GITHUB_URL')
  }
  
  if (patreon) {
    validateUrl(patreon, 'PATREON_URL')
  }
  
  if (kofi) {
    validateUrl(kofi, 'KOFI_URL')
  }
  
  // Validate email format if provided
  if (email && !validateEmail(email)) {
    throw new Error(
      `Invalid EMAIL_ADDRESS format: "${email}"\n` +
      `Expected a valid email address (e.g., user@example.com)`
    )
  }
  
  return {
    github,
    email,
    patreon,
    kofi,
  }
}

// ============================================================================
// Main Validation and Export
// ============================================================================

/**
 * Validate and export all environment configuration
 * This runs at build time and will fail the build if configuration is invalid
 */
function validateEnvironment(): EnvConfig {
  try {
    const site = validateSiteConfig()
    const giscus = validateGiscusConfig()
    const social = validateSocialLinks()
    
    return {
      site,
      giscus,
      social,
    }
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      throw new Error(
        `Environment validation failed:\n\n${error.message}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      )
    }
    throw error
  }
}

// Validate and export configuration
export const env = validateEnvironment()

// Export individual configs for convenience
export const siteConfig = env.site
export const giscusConfig = env.giscus
export const socialLinks = env.social
