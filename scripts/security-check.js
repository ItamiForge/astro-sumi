#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * This script performs comprehensive security checks including:
 * - npm audit for dependency vulnerabilities
 * - Environment file validation
 * - Basic security configuration checks
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

const SECURITY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical'
}

const EXIT_CODES = {
  SUCCESS: 0,
  VULNERABILITIES_FOUND: 1,
  CONFIGURATION_ERROR: 2,
  SCRIPT_ERROR: 3
}

class SecurityChecker {
  constructor() {
    this.vulnerabilities = []
    this.configIssues = []
    this.warnings = []
  }

  /**
   * Run npm audit and parse results
   */
  async checkDependencyVulnerabilities() {
    console.log('🔍 Checking for dependency vulnerabilities...')
    
    try {
      // Run npm audit and capture output
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const audit = JSON.parse(auditResult)
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        for (const [packageName, vulnerability] of Object.entries(audit.vulnerabilities)) {
          if (vulnerability.severity === SECURITY_LEVELS.HIGH || 
              vulnerability.severity === SECURITY_LEVELS.CRITICAL) {
            this.vulnerabilities.push({
              package: packageName,
              severity: vulnerability.severity,
              title: vulnerability.via?.[0]?.title || 'Unknown vulnerability',
              url: vulnerability.via?.[0]?.url
            })
          } else if (vulnerability.severity === SECURITY_LEVELS.MODERATE) {
            this.warnings.push({
              package: packageName,
              severity: vulnerability.severity,
              title: vulnerability.via?.[0]?.title || 'Unknown vulnerability'
            })
          }
        }
      }
      
      console.log(`✅ Dependency audit complete. Found ${this.vulnerabilities.length} high/critical vulnerabilities.`)
      
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout)
          // Process vulnerabilities as above
          if (audit.vulnerabilities) {
            for (const [packageName, vulnerability] of Object.entries(audit.vulnerabilities)) {
              if (vulnerability.severity === SECURITY_LEVELS.HIGH || 
                  vulnerability.severity === SECURITY_LEVELS.CRITICAL) {
                this.vulnerabilities.push({
                  package: packageName,
                  severity: vulnerability.severity,
                  title: vulnerability.via?.[0]?.title || 'Unknown vulnerability',
                  url: vulnerability.via?.[0]?.url
                })
              }
            }
          }
        } catch (parseError) {
          console.error('❌ Failed to parse npm audit output:', parseError.message)
          return false
        }
      } else {
        console.error('❌ Failed to run npm audit:', error.message)
        return false
      }
    }
    
    return true
  }

  /**
   * Check for sensitive files in version control
   */
  checkSensitiveFiles() {
    console.log('🔍 Checking for sensitive files...')
    
    const sensitiveFiles = [
      '.env.local',
      '.env.production',
      '.env.development',
      '.env.staging',
      'config/secrets.json',
      'private.key',
      'certificate.pem'
    ]
    
    const gitignoreExists = existsSync('.gitignore')
    if (!gitignoreExists) {
      this.configIssues.push({
        type: 'missing_gitignore',
        message: '.gitignore file is missing'
      })
    } else {
      const gitignoreContent = readFileSync('.gitignore', 'utf8')
      
      // Check if sensitive patterns are ignored
      const requiredPatterns = [
        '.env.local',
        '.env.production',
        '.env.development',
        '*.log'
      ]
      
      for (const pattern of requiredPatterns) {
        if (!gitignoreContent.includes(pattern)) {
          this.configIssues.push({
            type: 'missing_gitignore_pattern',
            message: `Pattern '${pattern}' should be in .gitignore`
          })
        }
      }
    }
    
    // Check if sensitive files exist and are tracked
    for (const file of sensitiveFiles) {
      if (existsSync(file)) {
        try {
          // Check if file is tracked by git
          execSync(`git ls-files --error-unmatch ${file}`, { stdio: 'pipe' })
          this.vulnerabilities.push({
            package: 'git',
            severity: SECURITY_LEVELS.HIGH,
            title: `Sensitive file '${file}' is tracked in version control`,
            file
          })
        } catch {
          // File is not tracked, which is good
        }
      }
    }
    
    console.log('✅ Sensitive file check complete.')
  }

  /**
   * Check security configuration
   */
  checkSecurityConfiguration() {
    console.log('🔍 Checking security configuration...')
    
    // Check if environment validation exists
    const envValidationExists = existsSync('src/lib/env.ts')
    if (!envValidationExists) {
      this.configIssues.push({
        type: 'missing_env_validation',
        message: 'Environment validation module (src/lib/env.ts) is missing'
      })
    }
    
    // Check if validation utilities exist
    const validationExists = existsSync('src/lib/validation.ts')
    if (!validationExists) {
      this.configIssues.push({
        type: 'missing_validation',
        message: 'Input validation module (src/lib/validation.ts) is missing'
      })
    }
    
    // Check package.json for security scripts
    const packageJsonExists = existsSync('package.json')
    if (packageJsonExists) {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
      const scripts = packageJson.scripts || {}
      
      const requiredSecurityScripts = [
        'security:audit',
        'security:fix',
        'security:check'
      ]
      
      for (const script of requiredSecurityScripts) {
        if (!scripts[script]) {
          this.warnings.push({
            package: 'package.json',
            severity: SECURITY_LEVELS.LOW,
            title: `Missing security script: ${script}`
          })
        }
      }
    }
    
    console.log('✅ Security configuration check complete.')
  }

  /**
   * Generate and display security report
   */
  generateReport() {
    console.log('\n📊 Security Report')
    console.log('==================')
    
    if (this.vulnerabilities.length === 0 && this.configIssues.length === 0) {
      console.log('✅ No security issues found!')
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  ${this.warnings.length} warning(s):`)
        for (const warning of this.warnings) {
          console.log(`   • ${warning.title} (${warning.package})`)
        }
      }
      
      return EXIT_CODES.SUCCESS
    }
    
    if (this.vulnerabilities.length > 0) {
      console.log(`\n❌ ${this.vulnerabilities.length} vulnerability(ies) found:`)
      for (const vuln of this.vulnerabilities) {
        console.log(`   • [${vuln.severity.toUpperCase()}] ${vuln.title}`)
        console.log(`     Package: ${vuln.package}`)
        if (vuln.url) {
          console.log(`     More info: ${vuln.url}`)
        }
        console.log()
      }
    }
    
    if (this.configIssues.length > 0) {
      console.log(`\n⚠️  ${this.configIssues.length} configuration issue(s):`)
      for (const issue of this.configIssues) {
        console.log(`   • ${issue.message}`)
      }
    }
    
    console.log('\n🔧 Recommended actions:')
    console.log('   1. Run "npm run security:fix" to auto-fix vulnerabilities')
    console.log('   2. Update dependencies manually if auto-fix fails')
    console.log('   3. Review and fix configuration issues')
    console.log('   4. Re-run security check after fixes')
    
    return this.vulnerabilities.length > 0 ? EXIT_CODES.VULNERABILITIES_FOUND : EXIT_CODES.SUCCESS
  }

  /**
   * Run all security checks
   */
  async runAllChecks() {
    console.log('🛡️  Starting comprehensive security check...\n')
    
    try {
      await this.checkDependencyVulnerabilities()
      this.checkSensitiveFiles()
      this.checkSecurityConfiguration()
      
      return this.generateReport()
    } catch (error) {
      console.error('❌ Security check failed:', error.message)
      return EXIT_CODES.SCRIPT_ERROR
    }
  }
}

// Run security check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new SecurityChecker()
  const exitCode = await checker.runAllChecks()
  process.exit(exitCode)
}

export { SecurityChecker }