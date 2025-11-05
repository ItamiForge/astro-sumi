/**
 * Tests for the setup script functionality
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const projectRoot = join(process.cwd())
const envPath = join(projectRoot, '.env.local')

describe('Setup Script', () => {
  beforeEach(() => {
    // Clean up any existing .env.local file
    if (existsSync(envPath)) {
      unlinkSync(envPath)
    }
  })

  afterEach(() => {
    // Clean up test .env.local file
    if (existsSync(envPath)) {
      unlinkSync(envPath)
    }
  })

  test('setup script exists and is executable', () => {
    const setupScriptPath = join(projectRoot, 'scripts', 'setup.js')
    expect(existsSync(setupScriptPath)).toBe(true)
    
    // Check if the file contains the expected setup functionality
    const scriptContent = readFileSync(setupScriptPath, 'utf8')
    expect(scriptContent).toContain('Astro Sumi Setup')
    expect(scriptContent).toContain('collectSiteConfig')
    expect(scriptContent).toContain('collectGiscusConfig')
    expect(scriptContent).toContain('collectSocialConfig')
    expect(scriptContent).toContain('collectContentConfig')
    expect(scriptContent).toContain('generateEnvFile')
  })

  test('package.json contains setup script', () => {
    const packageJsonPath = join(projectRoot, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    expect(packageJson.scripts).toHaveProperty('setup')
    expect(packageJson.scripts.setup).toBe('node scripts/setup.js')
  })

  test('setup script has proper structure for interactive CLI', () => {
    const setupScriptPath = join(projectRoot, 'scripts', 'setup.js')
    const scriptContent = readFileSync(setupScriptPath, 'utf8')
    
    // Check for essential CLI functionality
    expect(scriptContent).toContain('createInterface')
    expect(scriptContent).toContain('askQuestion')
    expect(scriptContent).toContain('askYesNo')
    expect(scriptContent).toContain('askChoice')
    
    // Check for configuration sections
    expect(scriptContent).toContain('Site Configuration')
    expect(scriptContent).toContain('Social Links Configuration')
    expect(scriptContent).toContain('Comment System Configuration')
    expect(scriptContent).toContain('Content Management')
    
    // Check for content management options
    expect(scriptContent).toContain('Keep sample novels')
    expect(scriptContent).toContain('Remove demo content')
    expect(scriptContent).toContain('Start completely fresh')
    
    // Check for social platform support
    expect(scriptContent).toContain('GitHub')
    expect(scriptContent).toContain('Patreon')
    expect(scriptContent).toContain('Ko-fi')
  })

  test('setup script includes proper error handling', () => {
    const setupScriptPath = join(projectRoot, 'scripts', 'setup.js')
    const scriptContent = readFileSync(setupScriptPath, 'utf8')
    
    // Check for error handling
    expect(scriptContent).toContain('try {')
    expect(scriptContent).toContain('catch (error)')
    expect(scriptContent).toContain('process.exit(1)')
    
    // Check for graceful shutdown
    expect(scriptContent).toContain('SIGINT')
    expect(scriptContent).toContain('rl.close()')
  })

  test('setup script includes validation functions', () => {
    const setupScriptPath = join(projectRoot, 'scripts', 'setup.js')
    const scriptContent = readFileSync(setupScriptPath, 'utf8')
    
    // Check for URL validation
    expect(scriptContent).toContain('new URL(value)')
    
    // Check for email validation
    expect(scriptContent).toContain('@')
    
    // Check for repository format validation
    expect(scriptContent).toContain('username/repository-name')
  })
})