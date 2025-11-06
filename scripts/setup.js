#!/usr/bin/env node

/**
 * Astro Sumi Setup Script - Simple Interactive Configuration
 */

import { readFileSync, writeFileSync, existsSync, accessSync, constants } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import pc from 'picocolors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// astroSumi aesthetic - inspired by Japanese sumi ink painting
const sumi = {
  // Core sumi ink colors
  reset: pc.reset,
  black: pc.black,
  white: pc.white,
  gray: pc.gray,
  
  // Text styles for sumi aesthetic
  bold: (text) => pc.bold(text),
  dim: (text) => pc.dim(text),
  
  // Minimal color accents (sparingly used)
  accent: (text) => pc.cyan(text),
  warning: (text) => pc.yellow(text),
  error: (text) => pc.red(text),
}

// Simple Unicode characters for visual structure
const brush = {
  dot: '•',               // Bullet point
  line: '─',              // Horizontal line
  pipe: '│',              // Vertical line
  corner: '└',            // Corner
  branch: '├',            // Branch
  space: ' ',             // Intentional whitespace
}

// TTY detection for graceful degradation
const IS_INTERACTIVE = process.stdout.isTTY && process.env.NO_COLOR !== '1'

// Helper function to conditionally apply styling
function style(text, styleFunc) {
  if (!IS_INTERACTIVE) {
    return text
  }
  return typeof styleFunc === 'function' ? styleFunc(text) : text
}

// Input validation functions
function validateUrl(input, allowEmpty = true) {
  if (!input || input.trim() === '') {
    return {
      isValid: allowEmpty,
      value: '',
      error: allowEmpty ? null : 'URL is required'
    }
  }
  
  const trimmedInput = input.trim()
  
  try {
    const url = new URL(trimmedInput)
    
    // Ensure it's http or https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        value: trimmedInput,
        error: 'URL must use http:// or https:// protocol'
      }
    }
    
    return {
      isValid: true,
      value: trimmedInput,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      value: trimmedInput,
      error: 'Invalid URL format. Example: https://example.com'
    }
  }
}

function validateEmail(input, allowEmpty = true) {
  if (!input || input.trim() === '') {
    return {
      isValid: allowEmpty,
      value: '',
      error: allowEmpty ? null : 'Email is required'
    }
  }
  
  const trimmedInput = input.trim()
  
  // Simple email regex - basic validation only
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(trimmedInput)) {
    return {
      isValid: false,
      value: trimmedInput,
      error: 'Invalid email format. Example: author@example.com'
    }
  }
  
  return {
    isValid: true,
    value: trimmedInput,
    error: null
  }
}

function validateGitHubRepo(input, allowEmpty = true) {
  if (!input || input.trim() === '') {
    return {
      isValid: allowEmpty,
      value: '',
      error: allowEmpty ? null : 'GitHub repository is required'
    }
  }
  
  const trimmedInput = input.trim()
  
  // GitHub repo format: username/repository-name
  // Allow alphanumeric, hyphens, underscores, and dots
  const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
  
  if (!repoRegex.test(trimmedInput)) {
    return {
      isValid: false,
      value: trimmedInput,
      error: 'Invalid repository format. Example: username/repository-name'
    }
  }
  
  // Additional validation: no consecutive special characters
  if (trimmedInput.includes('..') || trimmedInput.includes('--') || trimmedInput.includes('__')) {
    return {
      isValid: false,
      value: trimmedInput,
      error: 'Repository name cannot contain consecutive special characters'
    }
  }
  
  return {
    isValid: true,
    value: trimmedInput,
    error: null
  }
}

function sanitizeInput(input, maxLength = 200) {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Remove control characters and normalize whitespace
  const sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, maxLength) // Limit length
  
  return sanitized
}

function validateAndSanitizeInput(input, validator, defaultValue = '', maxLength = 200) {
  // First sanitize the input
  const sanitized = sanitizeInput(input, maxLength)
  
  // Then validate
  const validation = validator(sanitized, true)
  
  if (validation.isValid) {
    return {
      isValid: true,
      value: validation.value,
      error: null
    }
  } else {
    // If validation fails, use default value
    return {
      isValid: false,
      value: defaultValue,
      error: validation.error,
      usedDefault: true
    }
  }
}

// Cleanup function for graceful shutdown
function cleanup() {
  // Readline interfaces handle their own cleanup via close()
  // No additional cleanup needed in this script
}

// Prerequisite validation functions
function checkNodeVersion() {
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (majorVersion < 18) {
    throw new Error(`Node.js 18.x or higher is required. Current version: ${nodeVersion}`)
  }
  
  return {
    isValid: true,
    version: nodeVersion,
    message: `Node.js version ${nodeVersion} ✓`
  }
}

function checkFileSystemPermissions() {
  const envPath = join(projectRoot, '.env.local')
  
  try {
    // Check if we can write to the project root directory
    accessSync(projectRoot, constants.W_OK)
    
    // If .env.local exists, check if we can write to it
    if (existsSync(envPath)) {
      accessSync(envPath, constants.W_OK)
    }
    
    return {
      isValid: true,
      message: 'File system permissions ✓'
    }
  } catch (error) {
    throw new Error(`Cannot write to project directory. Check file permissions for: ${projectRoot}`)
  }
}

function checkProjectDirectory() {
  const packageJsonPath = join(projectRoot, 'package.json')
  
  if (!existsSync(packageJsonPath)) {
    throw new Error('package.json not found. Please run this script from the project root directory.')
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    // Verify this is an Astro project
    if (!packageJson.dependencies?.astro && !packageJson.devDependencies?.astro) {
      console.log(`${style(brush.space.repeat(6), sumi.dim)}${style('Warning: This doesn\'t appear to be an Astro project', sumi.warning)}`)
    }
    
    return {
      isValid: true,
      projectName: packageJson.name || 'Unknown',
      message: `Project directory validated ✓`
    }
  } catch (error) {
    throw new Error(`Invalid package.json file: ${error.message}`)
  }
}

function runPrerequisiteChecks() {
  console.log(`${style(brush.space.repeat(4) + 'Preparing workspace...', sumi.dim)}`)
  console.log('')
  
  try {
    const nodeCheck = checkNodeVersion()
    console.log(`${style(brush.space.repeat(6) + brush.dot + ' ' + nodeCheck.message, sumi.gray)}`)
    
    const permissionCheck = checkFileSystemPermissions()
    console.log(`${style(brush.space.repeat(6) + brush.dot + ' ' + permissionCheck.message, sumi.gray)}`)
    
    const projectCheck = checkProjectDirectory()
    console.log(`${style(brush.space.repeat(6) + brush.dot + ' ' + projectCheck.message, sumi.gray)}`)
    
    console.log('')
    console.log(`${style(brush.space.repeat(4) + 'Ready to begin.', sumi.dim)}`)
    console.log('')
    
    return {
      nodeVersion: nodeCheck.version,
      projectName: projectCheck.projectName
    }
  } catch (error) {
    console.log('')
    console.error(`${style(brush.space.repeat(4) + 'Setup cannot continue:', sumi.error)}`)
    console.error(`${style(brush.space.repeat(6) + error.message, sumi.error)}`)
    console.log('')
    
    console.log(`${style(brush.space.repeat(4) + 'Please resolve the issue and try again.', sumi.dim)}`)
    console.log('')
    process.exit(1)
  }
}

// astroSumi welcome banner with sumi ink aesthetic
function showSumiWelcome() {
  console.log('')
  console.log(`${style(brush.line.repeat(50), sumi.gray)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(12) + 'astroSumi Setup', sumi.bold)}`)
  console.log(`${style(brush.space.repeat(8) + 'Interactive Configuration', sumi.gray)}`)
  console.log('')
  console.log(`${style(brush.line.repeat(50), sumi.gray)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(4) + 'Like sumi ink on paper,', sumi.dim)}`)
  console.log(`${style(brush.space.repeat(4) + 'we\'ll paint your template with purpose.', sumi.dim)}`)
  console.log('')
}

// astroSumi completion message with sumi-inspired layout
function showSumiCompletion(config) {
  console.log('')
  console.log('')
  console.log(`${style(brush.line.repeat(50), sumi.gray)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(16) + 'Complete', pc.bold(pc.green))}`)
  console.log('')
  console.log(`${style(brush.space.repeat(8) + 'Your template is ready', sumi.gray)}`)
  console.log('')
  console.log(`${style(brush.line.repeat(50), sumi.gray)}`)
  console.log('')
  
  // Show configuration summary with sumi styling
  console.log(`${style(brush.space.repeat(4) + 'Configuration applied:', sumi.dim)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(6) + brush.dot + ' ' + config.siteTitle, sumi.gray)}`)
  console.log(`${style(brush.space.repeat(6) + brush.dot + ' ' + config.siteAuthor, sumi.gray)}`)
  if (config.enableComments) {
    console.log(`${style(brush.space.repeat(6) + brush.dot + ' Comments enabled', sumi.gray)}`)
  }
  console.log('')
  
  // Next steps with sumi aesthetic
  console.log(`${style(brush.space.repeat(4) + 'Next steps:', sumi.dim)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(6) + brush.corner + ' Run ', sumi.gray)}${style('bun run dev', sumi.accent)}${style(' to begin', sumi.gray)}`)
  console.log(`${style(brush.space.repeat(6) + brush.corner + ' Write in ', sumi.gray)}${style('src/content/novels/', sumi.accent)}`)
  console.log('')
  console.log(`${style(brush.space.repeat(4) + 'May your words flow like ink.', sumi.dim)}`)
  console.log('')
}

// Enhanced text input function with validation and better default handling
function ask(question, defaultValue = '', validator = null) {
  return new Promise((resolve) => {
    // Create a fresh readline interface for each question
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    })
    
    const displayDefault = defaultValue ? ` ${style(`(${defaultValue})`, sumi.gray)}` : ''
    const prompt = `${question}${displayDefault}: `
    
    // Handle Ctrl+C during input
    const handleSigInt = () => {
      console.log('')
      console.log(`${style(brush.space.repeat(4) + 'Input cancelled.', sumi.dim)}`)
      readline.close()
      process.exit(0)
    }
    
    const askQuestion = () => {
      process.once('SIGINT', handleSigInt)
      
      readline.question(prompt, (answer) => {
        process.removeListener('SIGINT', handleSigInt)
        readline.close()
        
        const trimmedAnswer = answer.trim()
        
        // If no input provided, use default
        if (!trimmedAnswer) {
          if (defaultValue) {
            console.log(`${style(brush.space.repeat(6) + 'Using default: ' + defaultValue, sumi.gray)}`)
          }
          resolve(defaultValue)
          return
        }
        
        // If validator provided, validate input
        if (validator) {
          const validation = validateAndSanitizeInput(trimmedAnswer, validator, defaultValue)
          
          if (validation.isValid) {
            resolve(validation.value)
          } else {
            // Show error and use default
            console.log(`${style(brush.space.repeat(6) + validation.error, sumi.warning)}`)
            if (validation.usedDefault) {
              console.log(`${style(brush.space.repeat(6) + 'Using default: ' + validation.value, sumi.gray)}`)
            }
            resolve(validation.value)
          }
        } else {
          // No validation, just sanitize
          const sanitized = sanitizeInput(trimmedAnswer)
          resolve(sanitized)
        }
      })
    }
    
    askQuestion()
  })
}

// Enhanced choice function with numbered selection and better keyboard handling
function askChoice(question, choices, defaultIndex = 0) {
  return new Promise((resolve, reject) => {
    // Create a fresh readline interface for each choice
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    })
    
    console.log(`${style(brush.space.repeat(4) + question, sumi.dim)}`)
    console.log('')
    
    // Display choices with clear numbering
    choices.forEach((choice, index) => {
      const isDefault = index === defaultIndex
      const marker = isDefault ? `${style(brush.dot, sumi.accent)}` : `${style(brush.space, sumi.gray)}`
      const number = `${style(String(index + 1), sumi.bold)}`
      const label = isDefault ? 
        `${style(choice.label, sumi.bold)} ${style('(default)', sumi.gray)}` : 
        `${style(choice.label, sumi.gray)}`
      
      console.log(`${brush.space.repeat(6)}${marker} ${number}. ${label}`)
    })
    
    const defaultChoice = defaultIndex + 1
    console.log('')
    
    // Handle Ctrl+C during choice selection
    const handleSigInt = () => {
      console.log('')
      console.log(`${style(brush.space.repeat(4) + 'Selection cancelled.', sumi.dim)}`)
      readline.close()
      process.exit(0)
    }
    
    process.once('SIGINT', handleSigInt)
    
    const promptText = `${brush.space.repeat(4)}Enter choice ${style(`(1-${choices.length})`, sumi.gray)} [${style(String(defaultChoice), sumi.bold)}]: `
    
    readline.question(promptText, (answer) => {
      process.removeListener('SIGINT', handleSigInt)
      readline.close()
      
      const trimmedAnswer = answer.trim()
      let choiceIndex
      
      if (!trimmedAnswer) {
        // Use default if no input
        choiceIndex = defaultIndex
        console.log(`${style(brush.space.repeat(6) + 'Using default: ' + choices[defaultIndex].label, sumi.gray)}`)
      } else {
        const choice = parseInt(trimmedAnswer)
        
        if (isNaN(choice) || choice < 1 || choice > choices.length) {
          console.log(`${style(brush.space.repeat(6) + `Invalid choice "${trimmedAnswer}". Using default.`, sumi.warning)}`)
          choiceIndex = defaultIndex
        } else {
          choiceIndex = choice - 1
          console.log(`${style(brush.space.repeat(6) + 'Selected: ' + choices[choiceIndex].label, sumi.gray)}`)
        }
      }
      
      console.log('')
      resolve(choices[choiceIndex])
    })
  })
}

// Main setup function
async function runSetup() {
  // Show sumi welcome banner
  showSumiWelcome()
  
  try {
    // Run prerequisite checks first
    runPrerequisiteChecks()
    
    // Site Configuration with sumi styling
    console.log(`${style(brush.space.repeat(4) + 'Site Configuration', sumi.dim)}`)
    console.log(`${style(brush.space.repeat(6) + 'Basic information for your template', sumi.gray)}`)
    console.log('')
    
    const siteTitle = await ask(`${brush.space.repeat(6)}Site title`, 'Your Novel Site')
    const siteDescription = await ask(`${brush.space.repeat(6)}Site description`, 'A collection of my novels and stories')
    const siteAuthor = await ask(`${brush.space.repeat(6)}Author name`, 'Your Name')
    const siteUrl = await ask(`${brush.space.repeat(6)}Site URL (include https://)`, 'https://your-site.com', validateUrl)
    
    console.log('')
    
    // Social Links with sumi styling
    console.log(`${style(brush.space.repeat(4) + 'Social Links', sumi.dim)}`)
    console.log(`${style(brush.space.repeat(6) + 'Connect with your readers (optional)', sumi.gray)}`)
    console.log('')
    
    const githubUrl = await ask(`${brush.space.repeat(6)}GitHub profile URL (optional)`, '', validateUrl)
    const emailAddress = await ask(`${brush.space.repeat(6)}Email address (optional)`, '', validateEmail)
    
    console.log('')
    
    // Comments with sumi styling
    const enableComments = await askChoice('Enable comment system?', [
      { label: 'Yes', value: true },
      { label: 'No', value: false }
    ])
    
    let giscusRepo = ''
    let giscusRepoId = ''
    
    if (enableComments.value) {
      console.log(`${style(brush.space.repeat(4) + 'Giscus Setup', sumi.dim)}`)
      console.log(`${style(brush.space.repeat(6) + 'Configure comment system', sumi.gray)}`)
      console.log('')
      console.log(`${style(brush.space.repeat(6) + brush.dot + ' Make repository public', sumi.gray)}`)
      console.log(`${style(brush.space.repeat(6) + brush.dot + ' Enable Discussions in settings', sumi.gray)}`)
      console.log(`${style(brush.space.repeat(6) + brush.dot + ' Install Giscus app: github.com/apps/giscus', sumi.gray)}`)
      console.log(`${style(brush.space.repeat(6) + brush.dot + ' Get config from: giscus.app', sumi.gray)}`)
      console.log('')
      
      giscusRepo = await ask(`${brush.space.repeat(6)}Repository (username/repository-name)`, '', validateGitHubRepo)
      giscusRepoId = await ask(`${brush.space.repeat(6)}Repository ID (from giscus.app)`, '')
      console.log('')
    }
    
    // Generate .env.local
    const envContent = `# Astro Sumi Configuration
# Generated by setup script

# Site Configuration
SITE_TITLE="${siteTitle}"
SITE_DESCRIPTION="${siteDescription}"
SITE_AUTHOR="${siteAuthor}"
SITE_URL="${siteUrl}"

# Social Links
${githubUrl ? `GITHUB_URL="${githubUrl}"` : '# GITHUB_URL=https://github.com/your-username'}
${emailAddress ? `EMAIL_ADDRESS="${emailAddress}"` : '# EMAIL_ADDRESS=author@example.com'}

# Comments
${enableComments.value ? 'COMMENTS_PROVIDER=giscus' : 'COMMENTS_PROVIDER=none'}
${giscusRepo ? `GISCUS_REPO="${giscusRepo}"` : '# GISCUS_REPO=your-username/your-repo'}
${giscusRepoId ? `GISCUS_REPO_ID="${giscusRepoId}"` : '# GISCUS_REPO_ID=your-repo-id'}
GISCUS_CATEGORY="General"
GISCUS_CATEGORY_ID="DIC_kwDOH_example"
`
    
    const envPath = join(projectRoot, '.env.local')
    writeFileSync(envPath, envContent, 'utf8')
    
    // Show sumi completion message
    showSumiCompletion({
      siteTitle,
      siteAuthor,
      enableComments: enableComments.value,
      needsGiscusSetup: enableComments.value && (!giscusRepo || !giscusRepoId)
    })
    
  } catch (error) {
    console.log('')
    console.error(`${style(brush.space.repeat(4) + 'Setup failed: ' + error.message, sumi.error)}`)
    console.log('')
    process.exit(1)
  }
}

// Enhanced Ctrl+C handling with proper cleanup
process.on('SIGINT', () => {
  console.log('')
  console.log('')
  console.log(`${style(brush.space.repeat(4) + 'Setup cancelled by user.', sumi.dim)}`)
  console.log('')
  process.exit(0)
})

// Handle other termination signals for complete cleanup
process.on('SIGTERM', () => {
  process.exit(0)
})

process.on('exit', () => {
  // Terminal cleanup handled by Node.js automatically
})

// Run setup
runSetup()