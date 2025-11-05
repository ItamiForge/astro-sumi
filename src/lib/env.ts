/**
 * Environment Configuration and Validation System
 * 
 * This module provides centralized environment variable validation with TypeScript schemas,
 * clear error messages, and fallback mechanisms for optional configuration values.
 * 
 * Features:
 * - Runtime validation of environment variables
 * - Type-safe environment configuration
 * - Fallback values for optional settings
 * - Clear error messages for missing required variables
 * - Support for Giscus comment system configuration
 */

import { z } from 'zod'

/**
 * Environment validation error class
 */
export class EnvironmentValidationError extends Error {
  constructor(
    public field: string,
    public expected: string,
    public received: unknown
  ) {
    super(`Environment validation failed for ${field}: expected ${expected}, received ${received}`)
    this.name = 'EnvironmentValidationError'
  }
}

/**
 * Giscus configuration schema with optional environment overrides
 * All fields are optional to allow fallback to hardcoded values
 */
const GiscusConfigSchema = z.object({
  repo: z.string().optional(),
  repoId: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  mapping: z.enum(['pathname', 'url', 'title', 'og:title', 'specific']).optional(),
  theme: z.string().optional(),
  lang: z.string().optional(),
  reactionsEnabled: z.enum(['0', '1']).optional(),
  emitMetadata: z.enum(['0', '1']).optional(),
  inputPosition: z.enum(['top', 'bottom']).optional(),
  loading: z.enum(['lazy', 'eager']).optional(),
  strict: z.enum(['0', '1']).optional(),
  enabled: z.boolean().optional(),
})

/**
 * Site configuration schema
 */
const SiteConfigSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  locale: z.string(),
  featuredNovelCount: z.number(),
  novelsPerPage: z.number(),
})

/**
 * Social configuration schema
 */
const SocialConfigSchema = z.object({
  githubUrl: z.string().url().optional(),
  emailAddress: z.string().email().optional(),
  patreonUrl: z.string().url().optional(),
  kofiUrl: z.string().url().optional(),
})

/**
 * Repository configuration schema
 */
const RepositoryConfigSchema = z.object({
  name: z.string(),
  owner: z.string(),
})

/**
 * Build configuration schema
 */
const BuildConfigSchema = z.object({
  mode: z.enum(['development', 'production']).default('development'),
  enableAnalytics: z.boolean().default(false),
})

/**
 * Site configuration type
 */
export type SiteConfig = z.infer<typeof SiteConfigSchema>

/**
 * Social configuration type
 */
export type SocialConfig = z.infer<typeof SocialConfigSchema>

/**
 * Repository configuration type
 */
export type RepositoryConfig = z.infer<typeof RepositoryConfigSchema>

/**
 * Build configuration type
 */
export type BuildConfig = z.infer<typeof BuildConfigSchema>

/**
 * Complete environment configuration schema
 */
const EnvironmentSchema = z.object({
  // Giscus configuration (all optional with fallbacks)
  GISCUS_REPO: z.string().optional(),
  GISCUS_REPO_ID: z.string().optional(),
  GISCUS_CATEGORY: z.string().optional(),
  GISCUS_CATEGORY_ID: z.string().optional(),
  GISCUS_MAPPING: z.enum(['pathname', 'url', 'title', 'og:title', 'specific']).optional(),
  GISCUS_THEME: z.string().optional(),
  GISCUS_LANG: z.string().optional(),
  GISCUS_REACTIONS_ENABLED: z.enum(['0', '1']).optional(),
  GISCUS_EMIT_METADATA: z.enum(['0', '1']).optional(),
  GISCUS_INPUT_POSITION: z.enum(['top', 'bottom']).optional(),
  GISCUS_LOADING: z.enum(['lazy', 'eager']).optional(),
  GISCUS_STRICT: z.enum(['0', '1']).optional(),
  GISCUS_ENABLED: z.string().transform((val) => val === 'true').optional(),
  
  // Comments provider selection
  COMMENTS_PROVIDER: z.enum(['giscus', 'none']).optional(),
  
  // Site configuration (optional)
  SITE_URL: z.string().url().optional(),
  SITE_TITLE: z.string().optional(),
  SITE_DESCRIPTION: z.string().optional(),
  SITE_AUTHOR: z.string().optional(),
  
  // Social configuration (optional)
  GITHUB_URL: z.string().url().optional(),
  EMAIL_ADDRESS: z.string().email().optional(),
  PATREON_URL: z.string().url().optional(),
  KOFI_URL: z.string().url().optional(),
  
  // Repository configuration (optional)
  REPOSITORY_NAME: z.string().optional(),
  REPOSITORY_OWNER: z.string().optional(),
  
  // Build configuration
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  ENABLE_ANALYTICS: z.union([
    z.string().transform((val) => val === 'true'),
    z.boolean()
  ]).default(false),
})

/**
 * Validated environment configuration type
 */
export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>

/**
 * Giscus configuration type
 */
export type GiscusConfig = z.infer<typeof GiscusConfigSchema>

/**
 * Default Giscus configuration (uses generic placeholder values)
 */
export const DEFAULT_GISCUS_CONFIG: Required<GiscusConfig> = {
  repo: 'your-username/your-repository',
  repoId: 'YOUR_REPO_ID',
  category: 'General',
  categoryId: 'YOUR_CATEGORY_ID',
  mapping: 'pathname',
  theme: 'light',
  lang: 'en',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  loading: 'lazy',
  strict: '0',
  enabled: false, // Disabled by default until configured
}

/**
 * Get environment variables with proper typing
 * Works in both Node.js and browser environments
 * 
 * Note: In Astro components, you should pass import.meta.env directly
 * to the validation functions instead of relying on this helper.
 */
function getEnvironmentVariables(): Record<string, string | undefined> {
  // Fallback for Node.js environments (like tests and build processes)
  if (typeof process !== 'undefined' && process.env) {
    return process.env
  }
  
  // Fallback for other environments
  return {}
}

/**
 * Validate environment variables and return typed configuration
 * 
 * @param env Optional environment object (use import.meta.env in Astro components)
 * @returns Validated environment configuration
 * @throws EnvironmentValidationError if validation fails
 */
export function validateEnvironment(env?: Record<string, any>): EnvironmentConfig {
  try {
    const envVars = env || getEnvironmentVariables()
    const result = EnvironmentSchema.parse(envVars)
    
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      throw new EnvironmentValidationError(
        firstError.path.join('.'),
        firstError.message,
        'received' in firstError ? firstError.received : 'unknown'
      )
    }
    throw error
  }
}

/**
 * Get Giscus configuration with environment overrides and fallbacks
 * 
 * @param envOrConfig Environment object (import.meta.env) or validated config
 * @returns Complete Giscus configuration with fallbacks
 */
export function getGiscusConfig(envOrConfig?: Record<string, any> | EnvironmentConfig): Required<GiscusConfig> {
  let envConfig: EnvironmentConfig
  
  if (envOrConfig && 'GISCUS_REPO' in envOrConfig) {
    // It's a raw environment object, validate it
    envConfig = validateEnvironment(envOrConfig)
  } else if (envOrConfig) {
    // It's already a validated config
    envConfig = envOrConfig as EnvironmentConfig
  } else {
    // No config provided, validate from system environment
    envConfig = validateEnvironment()
  }
  
  return {
    repo: envConfig.GISCUS_REPO || DEFAULT_GISCUS_CONFIG.repo,
    repoId: envConfig.GISCUS_REPO_ID || DEFAULT_GISCUS_CONFIG.repoId,
    category: envConfig.GISCUS_CATEGORY || DEFAULT_GISCUS_CONFIG.category,
    categoryId: envConfig.GISCUS_CATEGORY_ID || DEFAULT_GISCUS_CONFIG.categoryId,
    mapping: envConfig.GISCUS_MAPPING || DEFAULT_GISCUS_CONFIG.mapping,
    theme: envConfig.GISCUS_THEME || DEFAULT_GISCUS_CONFIG.theme,
    lang: envConfig.GISCUS_LANG || DEFAULT_GISCUS_CONFIG.lang,
    reactionsEnabled: envConfig.GISCUS_REACTIONS_ENABLED || DEFAULT_GISCUS_CONFIG.reactionsEnabled,
    emitMetadata: envConfig.GISCUS_EMIT_METADATA || DEFAULT_GISCUS_CONFIG.emitMetadata,
    inputPosition: envConfig.GISCUS_INPUT_POSITION || DEFAULT_GISCUS_CONFIG.inputPosition,
    loading: envConfig.GISCUS_LOADING || DEFAULT_GISCUS_CONFIG.loading,
    strict: envConfig.GISCUS_STRICT || DEFAULT_GISCUS_CONFIG.strict,
    enabled: envConfig.GISCUS_ENABLED !== undefined ? envConfig.GISCUS_ENABLED : DEFAULT_GISCUS_CONFIG.enabled,
  }
}

/**
 * Get site configuration with environment overrides and fallbacks
 * 
 * @param envOrConfig Environment object (import.meta.env) or validated config
 * @returns Site configuration with fallbacks
 */
export function getSiteConfig(envOrConfig?: Record<string, any> | EnvironmentConfig): SiteConfig {
  let envConfig: EnvironmentConfig
  
  if (envOrConfig && 'SITE_URL' in envOrConfig) {
    // It's a raw environment object, validate it
    envConfig = validateEnvironment(envOrConfig)
  } else if (envOrConfig) {
    // It's already a validated config
    envConfig = envOrConfig as EnvironmentConfig
  } else {
    // No config provided, validate from system environment
    envConfig = validateEnvironment()
  }
  
  const siteConfig = {
    url: envConfig.SITE_URL || 'https://your-site.com',
    title: envConfig.SITE_TITLE || 'Astro Sumi',
    description: envConfig.SITE_DESCRIPTION || 'A clean, minimal template specifically designed for novel and book writing projects',
    author: envConfig.SITE_AUTHOR || 'Template Author',
    locale: 'en-US',
    featuredNovelCount: 3,
    novelsPerPage: 6,
  }
  
  // Validate the final configuration
  return SiteConfigSchema.parse(siteConfig)
}

/**
 * Get social configuration with environment overrides and fallbacks
 * 
 * @param envOrConfig Environment object (import.meta.env) or validated config
 * @returns Social configuration with fallbacks
 */
export function getSocialConfig(envOrConfig?: Record<string, any> | EnvironmentConfig): SocialConfig {
  let envConfig: EnvironmentConfig
  
  if (envOrConfig && 'GITHUB_URL' in envOrConfig) {
    // It's a raw environment object, validate it
    envConfig = validateEnvironment(envOrConfig)
  } else if (envOrConfig) {
    // It's already a validated config
    envConfig = envOrConfig as EnvironmentConfig
  } else {
    // No config provided, validate from system environment
    envConfig = validateEnvironment()
  }
  
  const socialConfig = {
    githubUrl: envConfig.GITHUB_URL,
    emailAddress: envConfig.EMAIL_ADDRESS,
    patreonUrl: envConfig.PATREON_URL,
    kofiUrl: envConfig.KOFI_URL,
  }
  
  // Validate the final configuration
  return SocialConfigSchema.parse(socialConfig)
}

/**
 * Get repository configuration with environment overrides and fallbacks
 * 
 * @param envOrConfig Environment object (import.meta.env) or validated config
 * @returns Repository configuration with fallbacks
 */
export function getRepositoryConfig(envOrConfig?: Record<string, any> | EnvironmentConfig): RepositoryConfig {
  let envConfig: EnvironmentConfig
  
  if (envOrConfig && 'REPOSITORY_NAME' in envOrConfig) {
    // It's a raw environment object, validate it
    envConfig = validateEnvironment(envOrConfig)
  } else if (envOrConfig) {
    // It's already a validated config
    envConfig = envOrConfig as EnvironmentConfig
  } else {
    // No config provided, validate from system environment
    envConfig = validateEnvironment()
  }
  
  const repositoryConfig = {
    name: envConfig.REPOSITORY_NAME || 'your-repository',
    owner: envConfig.REPOSITORY_OWNER || 'your-username',
  }
  
  // Validate the final configuration
  return RepositoryConfigSchema.parse(repositoryConfig)
}

/**
 * Get build configuration with environment overrides and fallbacks
 * 
 * @param envOrConfig Environment object (import.meta.env) or validated config
 * @returns Build configuration with fallbacks
 */
export function getBuildConfig(envOrConfig?: Record<string, any> | EnvironmentConfig): BuildConfig {
  let envConfig: EnvironmentConfig
  
  if (envOrConfig && 'NODE_ENV' in envOrConfig) {
    // It's a raw environment object, validate it
    envConfig = validateEnvironment(envOrConfig)
  } else if (envOrConfig) {
    // It's already a validated config
    envConfig = envOrConfig as EnvironmentConfig
  } else {
    // No config provided, validate from system environment
    envConfig = validateEnvironment()
  }
  
  const buildConfig = {
    mode: envConfig.NODE_ENV,
    enableAnalytics: envConfig.ENABLE_ANALYTICS,
  }
  
  // Validate the final configuration
  return BuildConfigSchema.parse(buildConfig)
}

/**
 * Safe environment validation that doesn't throw errors
 * Useful for optional environment loading
 * 
 * @param env Optional environment object (use import.meta.env in Astro components)
 * @returns Validation result with success flag and data/error
 */
export function safeValidateEnvironment(env?: Record<string, any>): 
  | { success: true; data: EnvironmentConfig; error: null }
  | { success: false; data: null; error: EnvironmentValidationError } {
  try {
    const data = validateEnvironment(env)
    return { success: true, data, error: null }
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      return { success: false, data: null, error }
    }
    // Re-throw unexpected errors
    throw error
  }
}

/**
 * Initialize environment configuration with validation
 * Call this early in your application startup
 * 
 * @param env Optional environment object (use import.meta.env in Astro components)
 * @param options Configuration options
 * @returns Validated environment configuration
 */
export function initializeEnvironment(
  env?: Record<string, any>,
  options: {
    throwOnError?: boolean
    logErrors?: boolean
  } = {}
): EnvironmentConfig | null {
  const { throwOnError = false, logErrors = true } = options
  
  const result = safeValidateEnvironment(env)
  
  if (!result.success) {
    if (logErrors) {
      console.warn('Environment validation warning:', result.error.message)
      console.warn('Using fallback configuration values')
    }
    
    if (throwOnError) {
      throw result.error
    }
    
    // Return minimal configuration for graceful degradation
    return {
      NODE_ENV: 'development',
      ENABLE_ANALYTICS: false,
    }
  }
  
  return result.data
}