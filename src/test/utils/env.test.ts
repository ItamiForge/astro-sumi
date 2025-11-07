import { describe, test, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  validateEnvironment,
  getGiscusConfig,
  getSiteConfig,
  getSocialConfig,
  getRepositoryConfig,
  getBuildConfig,
  safeValidateEnvironment,
  initializeEnvironment,
  validateEnvironmentForBuild,
  validateEnvironmentWithContext,
  EnvironmentValidationError,
  DEFAULT_GISCUS_CONFIG,
  type EnvironmentConfig
} from '@/lib/env'

/**
 * Test environment configuration interface
 */
interface TestEnvironmentConfig {
  useRealValues: boolean
  envSource: 'env.local' | 'mock' | 'system'
  config: EnvironmentConfig
}

/**
 * Helper function to check if .env.local exists
 */
function checkEnvLocalExists(): boolean {
  const envLocalPath = join(process.cwd(), '.env.local')
  return existsSync(envLocalPath)
}

/**
 * Safe file reading with error handling
 */
function safeReadEnvLocal(): Record<string, string> | null {
  try {
    const envLocalPath = join(process.cwd(), '.env.local')
    if (!existsSync(envLocalPath)) {
      return null
    }
    
    const content = readFileSync(envLocalPath, 'utf-8')
    return parseEnvContent(content)
  } catch (error) {
    console.warn('Failed to read .env.local:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

/**
 * Parse .env.local content into key-value pairs
 */
function parseEnvContent(content: string): Record<string, string> {
  const env: Record<string, string> = {}
  
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }
    
    // Parse KEY=VALUE format
    const equalIndex = trimmedLine.indexOf('=')
    if (equalIndex === -1) {
      continue
    }
    
    const key = trimmedLine.slice(0, equalIndex).trim()
    let value = trimmedLine.slice(equalIndex + 1).trim()
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    
    if (key) {
      env[key] = value
    }
  }
  
  return env
}

/**
 * Load test environment configuration with real .env.local values when available
 */
function loadTestEnvironment(): TestEnvironmentConfig {
  // Check if .env.local exists and load real values
  const realEnvValues = safeReadEnvLocal()
  
  if (realEnvValues) {
    try {
      // Try to validate real values
      const config = validateEnvironment(realEnvValues)
      return {
        useRealValues: true,
        envSource: 'env.local',
        config
      }
    } catch (error) {
      // Real values are invalid, fall back to mock values
      console.warn('Real .env.local values failed validation, using mock values:', 
        error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  // Fallback to mock values
  const mockEnv = {
    GISCUS_REPO: 'test/repo',
    GISCUS_REPO_ID: 'R_test123',
    GISCUS_CATEGORY: 'General',
    GISCUS_CATEGORY_ID: 'DIC_test123',
    GISCUS_THEME: 'dark',
    SITE_URL: 'https://example.com',
    SITE_TITLE: 'Test Site',
    SITE_AUTHOR: 'Test Author',
    SITE_DESCRIPTION: 'Test Description',
    NODE_ENV: 'development' as const,
    ENABLE_ANALYTICS: 'false',
    GITHUB_URL: 'https://github.com/testuser',
    EMAIL_ADDRESS: 'test@example.com',
    REPOSITORY_NAME: 'test-repo',
    REPOSITORY_OWNER: 'testuser'
  }
  
  const config = validateEnvironment(mockEnv)
  return {
    useRealValues: false,
    envSource: 'mock',
    config
  }
}

describe('Environment Validation Functions', () => {
  let testConfig: TestEnvironmentConfig
  
  beforeAll(() => {
    testConfig = loadTestEnvironment()
    console.log(`🧪 Running tests with ${testConfig.envSource} values (real: ${testConfig.useRealValues})`)
  })
  describe('validateEnvironment', () => {
    test('validates with minimal environment', () => {
      const env = {}
      const result = validateEnvironment(env)
      
      expect(result.NODE_ENV).toBe('development')
      expect(result.ENABLE_ANALYTICS).toBe(false)
    })

    test('validates with complete environment', () => {
      // Use test config values when available, otherwise use mock values
      const env = testConfig.useRealValues ? {
        GISCUS_REPO: testConfig.config.GISCUS_REPO,
        GISCUS_REPO_ID: testConfig.config.GISCUS_REPO_ID,
        GISCUS_CATEGORY: testConfig.config.GISCUS_CATEGORY,
        GISCUS_CATEGORY_ID: testConfig.config.GISCUS_CATEGORY_ID,
        GISCUS_THEME: testConfig.config.GISCUS_THEME,
        SITE_URL: testConfig.config.SITE_URL,
        SITE_TITLE: testConfig.config.SITE_TITLE,
        NODE_ENV: 'production',
        ENABLE_ANALYTICS: 'true'
      } : {
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
      
      // Test that values are properly assigned
      if (env.GISCUS_REPO) expect(result.GISCUS_REPO).toBe(env.GISCUS_REPO)
      if (env.GISCUS_REPO_ID) expect(result.GISCUS_REPO_ID).toBe(env.GISCUS_REPO_ID)
      if (env.SITE_URL) expect(result.SITE_URL).toBe(env.SITE_URL)
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
      // Use real values when available, otherwise use mock values
      const env = testConfig.useRealValues ? {
        GISCUS_REPO: testConfig.config.GISCUS_REPO || 'custom/repo',
        GISCUS_THEME: testConfig.config.GISCUS_THEME || 'dark',
        GISCUS_ENABLED: testConfig.config.GISCUS_ENABLED !== undefined ? String(testConfig.config.GISCUS_ENABLED) : 'false'
      } : {
        GISCUS_REPO: 'custom/repo',
        GISCUS_THEME: 'dark',
        GISCUS_ENABLED: 'false'
      }
      
      const config = getGiscusConfig(env)
      
      if (env.GISCUS_REPO) expect(config.repo).toBe(env.GISCUS_REPO)
      if (env.GISCUS_THEME) expect(config.theme).toBe(env.GISCUS_THEME)
      expect(config.enabled).toBe(env.GISCUS_ENABLED === 'true')
      // Should still use defaults for non-overridden values
      if (!testConfig.useRealValues || !testConfig.config.GISCUS_REPO_ID) {
        expect(config.repoId).toBe(DEFAULT_GISCUS_CONFIG.repoId)
      }
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
      expect(config.author).toBe('Your Name (customize in .env.local)')
      expect(config.locale).toBe('en-US')
      expect(config.featuredNovelCount).toBe(3)
      expect(config.novelsPerPage).toBe(6)
    })

    test('overrides with environment variables', () => {
      // Use real values when available, otherwise use mock values
      const env = testConfig.useRealValues ? {
        SITE_URL: testConfig.config.SITE_URL || 'https://mynovel.com',
        SITE_TITLE: testConfig.config.SITE_TITLE || 'My Novel Site',
        SITE_DESCRIPTION: testConfig.config.SITE_DESCRIPTION || 'Custom description',
        SITE_AUTHOR: testConfig.config.SITE_AUTHOR || 'Custom Author'
      } : {
        SITE_URL: 'https://mynovel.com',
        SITE_TITLE: 'My Novel Site',
        SITE_DESCRIPTION: 'Custom description',
        SITE_AUTHOR: 'Custom Author'
      }
      
      const config = getSiteConfig(env)
      
      if (env.SITE_URL) expect(config.url).toBe(env.SITE_URL)
      if (env.SITE_TITLE) expect(config.title).toBe(env.SITE_TITLE)
      if (env.SITE_DESCRIPTION) expect(config.description).toBe(env.SITE_DESCRIPTION)
      if (env.SITE_AUTHOR) expect(config.author).toBe(env.SITE_AUTHOR)
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
      // Use real values when available, otherwise use mock values
      const env = testConfig.useRealValues ? {
        GITHUB_URL: testConfig.config.GITHUB_URL || 'https://github.com/myusername',
        EMAIL_ADDRESS: testConfig.config.EMAIL_ADDRESS || 'me@mysite.com'
      } : {
        GITHUB_URL: 'https://github.com/myusername',
        EMAIL_ADDRESS: 'me@mysite.com'
      }
      
      const config = getSocialConfig(env)
      
      if (env.GITHUB_URL) expect(config.githubUrl).toBe(env.GITHUB_URL)
      if (env.EMAIL_ADDRESS) expect(config.emailAddress).toBe(env.EMAIL_ADDRESS)
    })
  })

  describe('getRepositoryConfig', () => {
    test('returns default config when no environment provided', () => {
      const config = getRepositoryConfig({})
      
      expect(config.name).toBe('your-repository')
      expect(config.owner).toBe('your-username')
    })

    test('overrides with environment variables', () => {
      // Use real values when available, otherwise use mock values
      const env = testConfig.useRealValues ? {
        REPOSITORY_NAME: testConfig.config.REPOSITORY_NAME || 'my-novel-site',
        REPOSITORY_OWNER: testConfig.config.REPOSITORY_OWNER || 'myusername'
      } : {
        REPOSITORY_NAME: 'my-novel-site',
        REPOSITORY_OWNER: 'myusername'
      }
      
      const config = getRepositoryConfig(env)
      
      if (env.REPOSITORY_NAME) expect(config.name).toBe(env.REPOSITORY_NAME)
      if (env.REPOSITORY_OWNER) expect(config.owner).toBe(env.REPOSITORY_OWNER)
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
        NODE_ENV: 'production' as const,
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

  describe('validateEnvironmentForBuild', () => {
    test('returns valid status for good configuration', () => {
      const env = {
        SITE_URL: 'https://example.com',
        SITE_AUTHOR: 'Test Author',
        NODE_ENV: 'production'
      }
      
      const result = validateEnvironmentForBuild(env)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.hasRequiredValues).toBe(true)
      expect(result.configurationStatus.site).toBe('partial')
    })

    test('categorizes configuration issues correctly', () => {
      const env = {
        SITE_URL: 'invalid-url',
        EMAIL_ADDRESS: 'invalid-email'
      }
      
      const result = validateEnvironmentForBuild(env)
      
      expect(result.isValid).toBe(false)
      
      // Check that validation issues are detected
      const allIssues = [...result.errors, ...result.warnings]
      expect(allIssues.length).toBeGreaterThan(0)
      
      // At least one validation issue should be present for invalid values
      expect(allIssues.some(issue => 
        issue.includes('SITE_URL') || 
        issue.includes('EMAIL_ADDRESS') || 
        issue.includes('invalid')
      )).toBe(true)
    })

    test('provides helpful suggestions', () => {
      const env = {}
      
      const result = validateEnvironmentForBuild(env)
      
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions.some(s => s.includes('Customize your site'))).toBe(true)
    })
  })

  describe('validateEnvironmentWithContext', () => {
    test('handles build context validation', () => {
      const env = {
        SITE_URL: 'https://example.com',
        SITE_AUTHOR: 'Test Author'
      }
      
      const result = validateEnvironmentWithContext(env, 'build')
      
      expect(result.config).toBeDefined()
      expect(result.isValid).toBe(true)
      expect(result.issues).toBeDefined()
    })

    test('provides fallback for component context', () => {
      const env = {
        SITE_URL: 'invalid-url'
      }
      
      const result = validateEnvironmentWithContext(env, 'component')
      
      expect(result.config).toBeDefined() // Should provide fallback
      expect(result.isValid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    test('handles test context appropriately', () => {
      const env = {
        SITE_URL: 'invalid-url'
      }
      
      const result = validateEnvironmentWithContext(env, 'test')
      
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.level === 'error')).toBe(true)
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

  describe('Real Value Validation Tests', () => {
    test('validates real Giscus configuration when available', () => {
      if (!testConfig.useRealValues) {
        console.log('⏭️  Skipping real Giscus validation - no .env.local file found')
        return
      }

      // Load raw environment values and pass them to getGiscusConfig
      const realEnvValues = safeReadEnvLocal()
      if (!realEnvValues) return
      
      const giscusConfig = getGiscusConfig(realEnvValues)
      
      // Test that real values are properly loaded and validated
      expect(giscusConfig).toBeDefined()
      expect(typeof giscusConfig.repo).toBe('string')
      expect(typeof giscusConfig.theme).toBe('string')
      expect(typeof giscusConfig.enabled).toBe('boolean')
      
      // If real values are provided, they should not be the default placeholders
      if (testConfig.config.GISCUS_REPO) {
        expect(giscusConfig.repo).not.toBe(DEFAULT_GISCUS_CONFIG.repo)
        expect(giscusConfig.repo).toBe(testConfig.config.GISCUS_REPO)
      }
      
      if (testConfig.config.GISCUS_REPO_ID) {
        expect(giscusConfig.repoId).not.toBe(DEFAULT_GISCUS_CONFIG.repoId)
        expect(giscusConfig.repoId).toBe(testConfig.config.GISCUS_REPO_ID)
      }
      
      console.log('✅ Real Giscus configuration validated successfully')
    })

    test('validates real URLs and email addresses from .env.local', () => {
      if (!testConfig.useRealValues) {
        console.log('⏭️  Skipping real URL/email validation - no .env.local file found')
        return
      }

      // Load raw environment values and pass them to config functions
      const realEnvValues = safeReadEnvLocal()
      if (!realEnvValues) return
      
      const siteConfig = getSiteConfig(realEnvValues)
      const socialConfig = getSocialConfig(realEnvValues)
      
      // Test site URL if provided
      if (realEnvValues.SITE_URL) {
        expect(siteConfig.url).toBe(realEnvValues.SITE_URL)
        expect(() => new URL(siteConfig.url)).not.toThrow()
        console.log('✅ Real SITE_URL validated:', siteConfig.url)
      }
      
      // Test email address if provided
      if (realEnvValues.EMAIL_ADDRESS) {
        expect(socialConfig.emailAddress).toBe(realEnvValues.EMAIL_ADDRESS)
        expect(socialConfig.emailAddress).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        console.log('✅ Real EMAIL_ADDRESS validated:', socialConfig.emailAddress)
      }
      
      // Test GitHub URL if provided
      if (realEnvValues.GITHUB_URL) {
        expect(socialConfig.githubUrl).toBe(realEnvValues.GITHUB_URL)
        expect(() => new URL(socialConfig.githubUrl!)).not.toThrow()
        expect(socialConfig.githubUrl).toMatch(/^https:\/\/github\.com\//)
        console.log('✅ Real GITHUB_URL validated:', socialConfig.githubUrl)
      }
      
      // Test other social URLs if provided
      if (realEnvValues.PATREON_URL) {
        expect(socialConfig.patreonUrl).toBe(realEnvValues.PATREON_URL)
        expect(() => new URL(socialConfig.patreonUrl!)).not.toThrow()
        console.log('✅ Real PATREON_URL validated:', socialConfig.patreonUrl)
      }
      
      if (realEnvValues.KOFI_URL) {
        expect(socialConfig.kofiUrl).toBe(realEnvValues.KOFI_URL)
        expect(() => new URL(socialConfig.kofiUrl!)).not.toThrow()
        console.log('✅ Real KOFI_URL validated:', socialConfig.kofiUrl)
      }
    })

    test('verifies GitHub repository settings work with actual values', () => {
      if (!testConfig.useRealValues) {
        console.log('⏭️  Skipping real repository validation - no .env.local file found')
        return
      }

      // Load raw environment values and pass them to config functions
      const realEnvValues = safeReadEnvLocal()
      if (!realEnvValues) return
      
      const repoConfig = getRepositoryConfig(realEnvValues)
      
      // Test repository configuration if provided
      if (realEnvValues.REPOSITORY_NAME) {
        expect(repoConfig.name).toBe(realEnvValues.REPOSITORY_NAME)
        expect(repoConfig.name).not.toBe('your-repository')
        console.log('✅ Real REPOSITORY_NAME validated:', repoConfig.name)
      }
      
      if (realEnvValues.REPOSITORY_OWNER) {
        expect(repoConfig.owner).toBe(realEnvValues.REPOSITORY_OWNER)
        expect(repoConfig.owner).not.toBe('your-username')
        console.log('✅ Real REPOSITORY_OWNER validated:', repoConfig.owner)
      }
      
      // Test that Giscus repo matches repository config if both are provided
      if (realEnvValues.GISCUS_REPO && realEnvValues.REPOSITORY_NAME && realEnvValues.REPOSITORY_OWNER) {
        const expectedGiscusRepo = `${realEnvValues.REPOSITORY_OWNER}/${realEnvValues.REPOSITORY_NAME}`
        if (realEnvValues.GISCUS_REPO === expectedGiscusRepo) {
          console.log('✅ Giscus repo matches repository configuration')
        } else {
          console.log('ℹ️  Giscus repo differs from repository configuration (this is okay)')
        }
      }
    })

    test('validates complete real environment configuration', () => {
      if (!testConfig.useRealValues) {
        console.log('⏭️  Skipping complete real environment validation - no .env.local file found')
        return
      }

      // Test that the complete configuration is valid
      expect(testConfig.config).toBeDefined()
      expect(testConfig.config.NODE_ENV).toBeDefined()
      expect(testConfig.config.ENABLE_ANALYTICS).toBeDefined()
      
      // Test build validation with real values
      const realEnvValues = safeReadEnvLocal()
      if (realEnvValues) {
        const buildValidation = validateEnvironmentForBuild(realEnvValues)
        
        console.log('📊 Real environment validation results:')
        console.log(`  - Valid: ${buildValidation.isValid}`)
        console.log(`  - Errors: ${buildValidation.errors.length}`)
        console.log(`  - Warnings: ${buildValidation.warnings.length}`)
        console.log(`  - Site status: ${buildValidation.configurationStatus.site}`)
        console.log(`  - Social status: ${buildValidation.configurationStatus.social}`)
        console.log(`  - Comments status: ${buildValidation.configurationStatus.comments}`)
        
        if (buildValidation.errors.length > 0) {
          console.log('❌ Validation errors:', buildValidation.errors)
        }
        
        if (buildValidation.warnings.length > 0) {
          console.log('⚠️  Validation warnings:', buildValidation.warnings)
        }
        
        if (buildValidation.suggestions.length > 0) {
          console.log('💡 Suggestions:', buildValidation.suggestions)
        }
        
        // The test should pass even with warnings, but fail with errors
        expect(buildValidation.errors.length).toBe(0)
      }
      
      console.log('✅ Complete real environment configuration validated')
    })
  })
})