import { describe, test, expect } from 'vitest'
import {
  validateEnvironment,
  getGiscusConfig,
  getSiteConfig,
  getSocialConfig,
  getRepositoryConfig,
  getBuildConfig,
  safeValidateEnvironment,
  initializeEnvironment,
  EnvironmentValidationError,
  DEFAULT_GISCUS_CONFIG
} from '@/lib/env'

describe('Environment Validation Functions', () => {
  describe('validateEnvironment', () => {
    test('validates with minimal environment', () => {
      const env = {}
      const result = validateEnvironment(env)
      
      expect(result.NODE_ENV).toBe('development')
      expect(result.ENABLE_ANALYTICS).toBe(false)
    })

    test('validates with complete environment', () => {
      const env = {
        GISCUS_REPO: 'test/repo',
        GISCUS_REPO_ID: 'R_test123',
        GISCUS_CATEGORY: 'General',
        GISCUS_CATEGORY_ID: 'DIC_test123',
        GISCUS_THEME: 'dark',
        SITE_URL: 'https://example.com',
        SITE_TITLE: 'Test Site',
        NODE_ENV: 'production',
        ENABLE_ANALYTICS: 'true'
      }
      
      const result = validateEnvironment(env)
      
      expect(result.GISCUS_REPO).toBe('test/repo')
      expect(result.GISCUS_REPO_ID).toBe('R_test123')
      expect(result.SITE_URL).toBe('https://example.com')
      expect(result.NODE_ENV).toBe('production')
      expect(result.ENABLE_ANALYTICS).toBe(true)
    })

    test('throws EnvironmentValidationError for invalid URL', () => {
      const env = {
        SITE_URL: 'not-a-valid-url'
      }
      
      expect(() => validateEnvironment(env)).toThrow(EnvironmentValidationError)
    })

    test('transforms string booleans correctly', () => {
      const env = {
        ENABLE_ANALYTICS: 'true',
        GISCUS_ENABLED: 'true'
      }
      
      const result = validateEnvironment(env)
      expect(result.ENABLE_ANALYTICS).toBe(true)
      expect(result.GISCUS_ENABLED).toBe(true)
    })
  })

  describe('getGiscusConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getGiscusConfig({})
      
      expect(config.repo).toBe(DEFAULT_GISCUS_CONFIG.repo)
      expect(config.theme).toBe('light') // Updated to match new default theme
      expect(config.enabled).toBe(false) // Updated to match new default (disabled until configured)
    })

    test('overrides with environment variables', () => {
      const env = {
        GISCUS_REPO: 'custom/repo',
        GISCUS_THEME: 'dark',
        GISCUS_ENABLED: 'false'
      }
      
      const config = getGiscusConfig(env)
      
      expect(config.repo).toBe('custom/repo')
      expect(config.theme).toBe('dark')
      expect(config.enabled).toBe(false)
      // Should still use defaults for non-overridden values
      expect(config.repoId).toBe(DEFAULT_GISCUS_CONFIG.repoId)
    })

    test('accepts pre-validated config', () => {
      // Create a validated config object without GISCUS_REPO to test the "already validated" path
      const validatedConfig: any = {
        NODE_ENV: 'development',
        ENABLE_ANALYTICS: false,
        // This will use the default repo since no GISCUS_REPO is provided
      }
      
      const config = getGiscusConfig(validatedConfig)
      expect(config.repo).toBe(DEFAULT_GISCUS_CONFIG.repo) // Should use default
      expect(config.theme).toBe('light') // Should use default theme (updated)
    })
  })

  describe('getSiteConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getSiteConfig({})
      
      expect(config.url).toBe('https://your-site.com')
      expect(config.title).toBe('Astro Sumi')
      expect(config.description).toBe('A clean, minimal template specifically designed for novel and book writing projects')
      expect(config.author).toBe('Template Author')
      expect(config.locale).toBe('en-US')
      expect(config.featuredNovelCount).toBe(3)
      expect(config.novelsPerPage).toBe(6)
    })

    test('overrides with environment variables', () => {
      const env = {
        SITE_URL: 'https://mynovel.com',
        SITE_TITLE: 'My Novel Site',
        SITE_DESCRIPTION: 'Custom description',
        SITE_AUTHOR: 'Custom Author'
      }
      
      const config = getSiteConfig(env)
      
      expect(config.url).toBe('https://mynovel.com')
      expect(config.title).toBe('My Novel Site')
      expect(config.description).toBe('Custom description')
      expect(config.author).toBe('Custom Author')
    })
  })

  describe('getSocialConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getSocialConfig({})
      
      expect(config.githubUrl).toBeUndefined()
      expect(config.emailAddress).toBeUndefined()
      expect(config.patreonUrl).toBeUndefined()
      expect(config.kofiUrl).toBeUndefined()
    })

    test('overrides with environment variables', () => {
      const env = {
        GITHUB_URL: 'https://github.com/myusername',
        EMAIL_ADDRESS: 'me@mysite.com'
      }
      
      const config = getSocialConfig(env)
      
      expect(config.githubUrl).toBe('https://github.com/myusername')
      expect(config.emailAddress).toBe('me@mysite.com')
    })
  })

  describe('getRepositoryConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getRepositoryConfig({})
      
      expect(config.name).toBe('your-repository')
      expect(config.owner).toBe('your-username')
    })

    test('overrides with environment variables', () => {
      const env = {
        REPOSITORY_NAME: 'my-novel-site',
        REPOSITORY_OWNER: 'myusername'
      }
      
      const config = getRepositoryConfig(env)
      
      expect(config.name).toBe('my-novel-site')
      expect(config.owner).toBe('myusername')
    })
  })

  describe('getBuildConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getBuildConfig({})
      
      expect(config.mode).toBe('development')
      expect(config.enableAnalytics).toBe(false)
    })

    test('overrides with environment variables', () => {
      const env = {
        NODE_ENV: 'production',
        ENABLE_ANALYTICS: 'true'
      }
      
      const config = getBuildConfig(env)
      
      expect(config.mode).toBe('production')
      expect(config.enableAnalytics).toBe(true)
    })
  })

  describe('safeValidateEnvironment', () => {
    test('returns success for valid environment', () => {
      const env = { NODE_ENV: 'production' }
      const result = safeValidateEnvironment(env)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })

    test('returns error for invalid environment', () => {
      const env = { SITE_URL: 'invalid-url' }
      const result = safeValidateEnvironment(env)
      
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(EnvironmentValidationError)
    })
  })

  describe('initializeEnvironment', () => {
    test('returns config for valid environment', () => {
      const env = { NODE_ENV: 'production' }
      const result = initializeEnvironment(env)
      
      expect(result).toBeDefined()
      expect(result?.NODE_ENV).toBe('production')
    })

    test('returns fallback config for invalid environment', () => {
      const env = { SITE_URL: 'invalid-url' }
      const result = initializeEnvironment(env, { throwOnError: false, logErrors: false })
      
      expect(result).toBeDefined()
      expect(result?.NODE_ENV).toBe('development')
      expect(result?.ENABLE_ANALYTICS).toBe(false)
    })

    test('throws error when throwOnError is true', () => {
      const env = { SITE_URL: 'invalid-url' }
      
      expect(() => initializeEnvironment(env, { throwOnError: true, logErrors: false }))
        .toThrow(EnvironmentValidationError)
    })
  })

  describe('EnvironmentValidationError', () => {
    test('creates error with correct properties', () => {
      const error = new EnvironmentValidationError('SITE_URL', 'valid URL', 'invalid-url')
      
      expect(error.name).toBe('EnvironmentValidationError')
      expect(error.field).toBe('SITE_URL')
      expect(error.expected).toBe('valid URL')
      expect(error.received).toBe('invalid-url')
      expect(error.message).toContain('SITE_URL')
      expect(error.message).toContain('valid URL')
      expect(error.message).toContain('invalid-url')
    })
  })
})