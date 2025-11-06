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
 * Environment validation error class with helpful suggestions
 */
export class EnvironmentValidationError extends Error {
  constructor(
    public field: string,
    public expected: string,
    public received: unknown,
    public suggestion?: string
  ) {
    const baseMessage = `Environment validation failed for ${field}: expected ${expected}, received ${received}`
    const fullMessage = suggestion ? `${baseMessage}\nSuggestion: ${suggestion}` : baseMessage
    super(fullMessage)
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
 * Raw environment variables interface for better TypeScript support
 * This represents the actual environment variables before validation
 */
export interface RawEnvironmentVariables {
  // Giscus configuration
  GISCUS_REPO?: string
  GISCUS_REPO_ID?: string
  GISCUS_CATEGORY?: string
  GISCUS_CATEGORY_ID?: string
  GISCUS_MAPPING?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific'
  GISCUS_THEME?: string
  GISCUS_LANG?: string
  GISCUS_REACTIONS_ENABLED?: '0' | '1'
  GISCUS_EMIT_METADATA?: '0' | '1'
  GISCUS_INPUT_POSITION?: 'top' | 'bottom'
  GISCUS_LOADING?: 'lazy' | 'eager'
  GISCUS_STRICT?: '0' | '1'
  GISCUS_ENABLED?: string
  
  // Comments provider
  COMMENTS_PROVIDER?: 'giscus' | 'none'
  
  // Site configuration
  SITE_URL?: string
  SITE_TITLE?: string
  SITE_DESCRIPTION?: string
  SITE_AUTHOR?: string
  
  // Social configuration
  GITHUB_URL?: string
  EMAIL_ADDRESS?: string
  PATREON_URL?: string
  KOFI_URL?: string
  
  // Repository configuration
  REPOSITORY_NAME?: string
  REPOSITORY_OWNER?: string
  
  // Build configuration
  NODE_ENV?: 'development' | 'production'
  ENABLE_ANALYTICS?: string | boolean
}

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
 * Works in Node.js environments (build processes, tests)
 * 
 * Note: In Astro components, you should pass import.meta.env directly
 * to the validation functions instead of relying on this helper.
 */
function getEnvironmentVariables(): Record<string, string | undefined> {
  // Use Node.js process.env for build-time and server-side contexts
  if (typeof process !== 'undefined' && process.env) {
    return process.env
  }
  
  // Fallback for other environments
  return {}
}

/**
 * Get helpful suggestion for environment validation errors with specific guidance
 */
function getValidationSuggestion(field: string, code: string, received: unknown): string {
  const fieldName = field.toUpperCase()
  
  switch (code) {
    case 'invalid_url':
      if (fieldName === 'SITE_URL') {
        return `${fieldName} must be a valid URL starting with http:// or https://. Example: https://mynovelsite.com (this will be used for canonical URLs and RSS feeds)`
      }
      if (fieldName.includes('GITHUB')) {
        return `${fieldName} must be a valid GitHub URL. Example: https://github.com/yourusername`
      }
      if (fieldName.includes('PATREON')) {
        return `${fieldName} must be a valid Patreon URL. Example: https://patreon.com/yourusername`
      }
      if (fieldName.includes('KOFI')) {
        return `${fieldName} must be a valid Ko-fi URL. Example: https://ko-fi.com/yourusername`
      }
      return `${fieldName} must be a valid URL starting with http:// or https://. Example: https://example.com`
    
    case 'invalid_email':
      return `${fieldName} must be a valid email address. Example: author@mynovelsite.com (this will be used for contact links and RSS feeds)`
    
    case 'invalid_enum_value':
      if (fieldName.includes('GISCUS_MAPPING')) {
        return `${fieldName} must be one of: "pathname", "url", "title", "og:title", "specific". Recommended: "pathname" for consistent comment mapping.`
      }
      if (fieldName.includes('GISCUS_THEME')) {
        return `${fieldName} must be a valid Giscus theme. Popular options: "light", "dark", "preferred_color_scheme", "transparent_dark". Check https://giscus.app for all options.`
      }
      if (fieldName.includes('GISCUS_LOADING')) {
        return `${fieldName} must be either "lazy" (recommended for performance) or "eager" (loads immediately).`
      }
      if (fieldName.includes('GISCUS_INPUT_POSITION')) {
        return `${fieldName} must be either "top" (comment box above comments) or "bottom" (comment box below comments).`
      }
      if (fieldName.includes('GISCUS_REACTIONS_ENABLED') || fieldName.includes('GISCUS_EMIT_METADATA') || fieldName.includes('GISCUS_STRICT')) {
        return `${fieldName} must be either "1" (enabled) or "0" (disabled). Giscus requires this specific format.`
      }
      if (fieldName.includes('COMMENTS_PROVIDER')) {
        return `${fieldName} must be one of: "giscus" (GitHub Discussions), "none" (disable comments). Default: "giscus".`
      }
      if (fieldName === 'NODE_ENV') {
        return `${fieldName} must be either "development" or "production".`
      }
      return `${fieldName} must be one of the allowed values. Check the .env.example file for valid options.`
    
    case 'invalid_type':
      if (typeof received === 'string' && (received === 'true' || received === 'false')) {
        if (fieldName.includes('GISCUS') && !fieldName.includes('GISCUS_ENABLED')) {
          return `${fieldName} appears to be a boolean string. For Giscus variables, use "1" for true and "0" for false instead of "true"/"false".`
        }
        return `${fieldName} appears to be a boolean string. Use "true" or "false" for this variable.`
      }
      if (fieldName.includes('GISCUS_REPO') && typeof received === 'string') {
        return `${fieldName} should be in format "username/repository-name". Example: "myusername/my-novel-site". Make sure the repository exists and is public.`
      }
      return `${fieldName} has an invalid type. Check the .env.example file for the expected format.`
    
    case 'too_small':
      if (fieldName.includes('REPO') || fieldName.includes('CATEGORY')) {
        return `${fieldName} cannot be empty. Check your Giscus configuration at https://giscus.app to get the correct values.`
      }
      return `${fieldName} cannot be empty. Provide a valid value or remove the variable to use the default.`
    
    case 'too_big':
      return `${fieldName} is too long. Check the .env.example file for the expected format.`
    
    default:
      if (fieldName.includes('GISCUS')) {
        return `Check your Giscus configuration at https://giscus.app and ensure ${fieldName} matches the generated values.`
      }
      return `Check the .env.example file for the correct format of ${fieldName}. If you're not using this feature, you can remove this variable.`
  }
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
      // Find the most critical error (prioritize required fields and type errors)
      const criticalError = error.issues.find(issue => 
        issue.code === 'invalid_type' || 
        issue.code === 'invalid_string'
      ) || error.issues[0]
      
      const field = criticalError.path.join('.')
      const received = 'received' in criticalError ? criticalError.received : 'unknown'
      const suggestion = getValidationSuggestion(field, criticalError.code, received)
      
      // Create detailed error message with context
      // const errorMessage = `Environment validation failed for ${field}: ${criticalError.message}`
      
      throw new EnvironmentValidationError(
        field,
        criticalError.message,
        received,
        suggestion
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
    author: envConfig.SITE_AUTHOR || 'Your Name (customize in .env.local)',
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
 * Validate environment for build-time checks
 * This function provides comprehensive validation without breaking the build process
 * 
 * @param env Optional environment object
 * @returns Detailed validation summary with categorized issues
 */
export function validateEnvironmentForBuild(env?: Record<string, any>): {
  isValid: boolean
  warnings: string[]
  errors: string[]
  hasRequiredValues: boolean
  configurationStatus: {
    site: 'complete' | 'partial' | 'placeholder'
    social: 'complete' | 'partial' | 'none'
    comments: 'configured' | 'default' | 'disabled'
  }
  suggestions: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []
  const suggestions: string[] = []
  
  const envVars = env || getEnvironmentVariables()
  
  // Validate individual fields with detailed categorization
  const result = safeValidateEnvironment(env)
  
  if (!result.success) {
    const error = result.error
    
    // Categorize validation issues more granularly
    if (error.field.includes('URL') && error.received) {
      if (typeof error.received === 'string' && error.received.length > 0) {
        errors.push(`${error.field}: Invalid URL format - "${error.received}". ${error.suggestion || ''}`)
      } else {
        warnings.push(`${error.field}: Empty URL value. ${error.suggestion || ''}`)
      }
    } else if (error.field.includes('EMAIL') && error.received) {
      if (typeof error.received === 'string' && error.received.length > 0) {
        errors.push(`${error.field}: Invalid email format - "${error.received}". ${error.suggestion || ''}`)
      } else {
        warnings.push(`${error.field}: Empty email value. ${error.suggestion || ''}`)
      }
    } else if (error.field.includes('GISCUS') && error.received) {
      warnings.push(`${error.field}: Invalid Giscus configuration - "${error.received}". ${error.suggestion || ''}`)
    } else if (error.received === undefined || error.received === '') {
      // This is expected for optional variables
      // Don't add to warnings unless it's an important field
    } else {
      errors.push(`${error.field}: ${error.message}. ${error.suggestion || ''}`)
    }
  }
  
  // Analyze configuration completeness
  const siteStatus = analyzeSiteConfiguration(envVars)
  const socialStatus = analyzeSocialConfiguration(envVars)
  const commentsStatus = analyzeCommentsConfiguration(envVars)
  
  // Generate contextual suggestions
  if (siteStatus === 'placeholder') {
    suggestions.push('🏠 Customize your site: Set SITE_URL, SITE_TITLE, SITE_DESCRIPTION, and SITE_AUTHOR in .env.local')
  } else if (siteStatus === 'partial') {
    suggestions.push('🔧 Complete site setup: Some site configuration values are still using defaults')
  }
  
  if (socialStatus === 'none') {
    suggestions.push('🔗 Add social links: Set GITHUB_URL, EMAIL_ADDRESS, PATREON_URL, or KOFI_URL to display social links')
  }
  
  if (commentsStatus === 'default') {
    suggestions.push('💬 Customize comments: Configure your own Giscus repository for personalized comment system')
  }
  
  // Check for common configuration issues
  if (envVars.GISCUS_REPO && !envVars.GISCUS_REPO_ID) {
    warnings.push('GISCUS_REPO is set but GISCUS_REPO_ID is missing. Visit https://giscus.app to get your complete configuration.')
  }
  
  if (envVars.SITE_URL && !envVars.SITE_URL.startsWith('http')) {
    errors.push('SITE_URL must include protocol (http:// or https://)')
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    hasRequiredValues: siteStatus !== 'placeholder',
    configurationStatus: {
      site: siteStatus,
      social: socialStatus,
      comments: commentsStatus,
    },
    suggestions,
  }
}

/**
 * Analyze site configuration completeness
 */
function analyzeSiteConfiguration(env: Record<string, any>): 'complete' | 'partial' | 'placeholder' {
  const hasCustomUrl = env.SITE_URL && env.SITE_URL !== 'https://your-site.com'
  const hasCustomTitle = env.SITE_TITLE && env.SITE_TITLE !== 'Astro Sumi'
  const hasCustomAuthor = env.SITE_AUTHOR && !env.SITE_AUTHOR?.includes('customize') && env.SITE_AUTHOR !== 'Your Name'
  const hasCustomDescription = env.SITE_DESCRIPTION && env.SITE_DESCRIPTION !== 'A clean, minimal template specifically designed for novel and book writing projects'
  
  const customFields = [hasCustomUrl, hasCustomTitle, hasCustomAuthor, hasCustomDescription].filter(Boolean).length
  
  if (customFields === 0) return 'placeholder'
  if (customFields >= 3) return 'complete'
  return 'partial'
}

/**
 * Analyze social configuration completeness
 */
function analyzeSocialConfiguration(env: Record<string, any>): 'complete' | 'partial' | 'none' {
  const socialFields = [env.GITHUB_URL, env.EMAIL_ADDRESS, env.PATREON_URL, env.KOFI_URL].filter(Boolean).length
  
  if (socialFields === 0) return 'none'
  if (socialFields >= 2) return 'complete'
  return 'partial'
}

/**
 * Analyze comments configuration status
 */
function analyzeCommentsConfiguration(env: Record<string, any>): 'configured' | 'default' | 'disabled' {
  if (env.GISCUS_ENABLED === 'false' || env.COMMENTS_PROVIDER === 'none') {
    return 'disabled'
  }
  
  const hasCustomRepo = env.GISCUS_REPO && env.GISCUS_REPO !== 'your-username/your-repository'
  const hasRepoId = env.GISCUS_REPO_ID && env.GISCUS_REPO_ID !== 'YOUR_REPO_ID'
  
  if (hasCustomRepo && hasRepoId) return 'configured'
  return 'default'
}

/**
 * Context-aware environment loader for Astro components
 * Automatically detects the runtime context and uses appropriate environment source
 * 
 * @param astroEnv Optional import.meta.env from Astro component
 * @returns Environment variables from the appropriate context
 */
export function getContextualEnvironment(astroEnv?: Record<string, any>): Record<string, any> {
  // If Astro environment is explicitly provided, use it
  if (astroEnv) {
    return astroEnv
  }
  
  // Auto-detect context and return appropriate environment
  return getEnvironmentVariables()
}

/**
 * Validate environment with context-aware error handling
 * Provides different validation behavior based on the runtime context
 * 
 * @param env Environment variables to validate
 * @param context Runtime context for appropriate error handling
 * @returns Validation result with context-appropriate error handling
 */
export function validateEnvironmentWithContext(
  env?: Record<string, any>,
  context: 'build' | 'runtime' | 'component' | 'test' = 'runtime'
): {
  config: EnvironmentConfig | null
  isValid: boolean
  issues: Array<{
    field: string
    level: 'error' | 'warning' | 'info'
    message: string
    suggestion?: string
  }>
} {
  const issues: Array<{
    field: string
    level: 'error' | 'warning' | 'info'
    message: string
    suggestion?: string
  }> = []
  
  // For build context, use comprehensive validation
  if (context === 'build') {
    const buildValidation = validateEnvironmentForBuild(env)
    
    // Convert build validation results to issues format
    buildValidation.errors.forEach(error => {
      const [field, ...messageParts] = error.split(':')
      issues.push({
        field: field.trim(),
        level: 'error',
        message: messageParts.join(':').trim(),
      })
    })
    
    buildValidation.warnings.forEach(warning => {
      const [field, ...messageParts] = warning.split(':')
      issues.push({
        field: field.trim(),
        level: 'warning',
        message: messageParts.join(':').trim(),
      })
    })
    
    buildValidation.suggestions.forEach(suggestion => {
      issues.push({
        field: 'CONFIGURATION',
        level: 'info',
        message: suggestion,
      })
    })
  }
  
  // Attempt to get a working configuration
  const result = safeValidateEnvironment(env)
  
  if (result.success) {
    return {
      config: result.data,
      isValid: true,
      issues,
    }
  }
  
  // Handle validation failure based on context
  const error = result.error
  issues.push({
    field: error.field,
    level: context === 'test' ? 'error' : 'warning',
    message: error.message,
    suggestion: error.suggestion,
  })
  
  // For component and runtime contexts, try to provide a working fallback
  if (context === 'runtime') {
    const fallbackConfig = initializeEnvironment(env, { 
      throwOnError: false, 
      logErrors: false,
      context 
    })
    
    return {
      config: fallbackConfig,
      isValid: false,
      issues,
    }
  }
  
  // For build and test contexts, don't provide fallback
  return {
    config: null,
    isValid: false,
    issues,
  }
}

/**
 * Initialize environment configuration with enhanced validation and graceful degradation
 * Call this early in your application startup
 * 
 * @param env Optional environment object (use import.meta.env in Astro components)
 * @param options Configuration options
 * @returns Validated environment configuration or graceful fallback
 */
export function initializeEnvironment(
  env?: Record<string, any>,
  options: {
    throwOnError?: boolean
    logErrors?: boolean
    logLevel?: 'error' | 'warn' | 'info' | 'silent'
    context?: 'build' | 'runtime' | 'test'
  } = {}
): EnvironmentConfig | null {
  const { 
    throwOnError = false, 
    logErrors = true, 
    logLevel = 'warn',
    context = 'runtime'
  } = options
  
  // Use build-time validation for better error categorization
  if (context === 'build') {
    const buildValidation = validateEnvironmentForBuild(env)
    
    if (logErrors && logLevel !== 'silent') {
      const logFn = logLevel === 'error' ? console.error : logLevel === 'info' ? console.info : console.warn
      
      if (buildValidation.errors.length > 0) {
        logFn('❌ Environment Configuration Errors:')
        buildValidation.errors.forEach(error => logFn(`  • ${error}`))
      }
      
      if (buildValidation.warnings.length > 0 && logLevel !== 'error') {
        logFn('⚠️  Environment Configuration Warnings:')
        buildValidation.warnings.forEach(warning => logFn(`  • ${warning}`))
      }
      
      if (buildValidation.suggestions.length > 0 && logLevel === 'info') {
        logFn('💡 Configuration Suggestions:')
        buildValidation.suggestions.forEach(suggestion => logFn(`  • ${suggestion}`))
      }
      
      // Show configuration status summary
      if (logLevel === 'info') {
        const { site, social, comments } = buildValidation.configurationStatus
        logFn(`📊 Configuration Status: Site: ${site}, Social: ${social}, Comments: ${comments}`)
      }
    }
    
    if (!buildValidation.isValid && throwOnError) {
      throw new EnvironmentValidationError(
        'BUILD_VALIDATION',
        'Build-time validation failed',
        buildValidation.errors,
        'Fix the configuration errors listed above'
      )
    }
  }
  
  // Perform runtime validation
  const result = safeValidateEnvironment(env)
  
  if (!result.success) {
    if (logErrors && logLevel !== 'silent') {
      const logFn = logLevel === 'error' ? console.error : logLevel === 'info' ? console.info : console.warn
      
      logFn('🔧 Environment validation issue:', result.error.message)
      if (result.error.suggestion) {
        logFn('💡 Suggestion:', result.error.suggestion)
      }
      
      if (context !== 'test') {
        logFn('🔄 Using fallback configuration values to continue...')
        
        // In development, provide more helpful information
        const isDevelopment = env?.NODE_ENV === 'development' || 
                             (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
        
        if (isDevelopment) {
          logFn('📝 To customize: copy .env.example to .env.local and update the values')
          logFn('🌐 Template works out-of-the-box with sensible defaults')
        }
      }
    }
    
    if (throwOnError) {
      throw result.error
    }
    
    // Return graceful fallback configuration that allows the app to continue
    const fallbackEnv = env || getEnvironmentVariables()
    return {
      NODE_ENV: (fallbackEnv.NODE_ENV as 'development' | 'production') || 'development',
      ENABLE_ANALYTICS: false,
      // Include any valid values that were successfully parsed
      ...(fallbackEnv.SITE_URL && isValidUrl(fallbackEnv.SITE_URL) ? { SITE_URL: fallbackEnv.SITE_URL } : {}),
      ...(fallbackEnv.SITE_TITLE ? { SITE_TITLE: fallbackEnv.SITE_TITLE } : {}),
      ...(fallbackEnv.SITE_DESCRIPTION ? { SITE_DESCRIPTION: fallbackEnv.SITE_DESCRIPTION } : {}),
      ...(fallbackEnv.SITE_AUTHOR ? { SITE_AUTHOR: fallbackEnv.SITE_AUTHOR } : {}),
    }
  }
  
  return result.data
}

/**
 * Simple URL validation helper
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}