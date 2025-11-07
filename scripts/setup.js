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

// Selection State Management for keyboard navigation
class SelectionState {
  constructor(choices, defaultIndex = 0) {
    this.choices = choices
    this.currentIndex = Math.max(0, Math.min(defaultIndex, choices.length - 1))
    this.maxIndex = choices.length - 1
  }
  
  moveUp() {
    if (this.currentIndex === 0) {
      // Wrap to last option when at first option
      this.currentIndex = this.maxIndex
    } else {
      this.currentIndex--
    }
    return this.currentIndex
  }
  
  moveDown() {
    if (this.currentIndex === this.maxIndex) {
      // Wrap to first option when at last option
      this.currentIndex = 0
    } else {
      this.currentIndex++
    }
    return this.currentIndex
  }
  
  getCurrentChoice() {
    return this.choices[this.currentIndex]
  }
  
  getCurrentIndex() {
    return this.currentIndex
  }
  
  setCurrentIndex(index) {
    if (index >= 0 && index <= this.maxIndex) {
      this.currentIndex = index
      return true
    }
    return false
  }
  
  isValidIndex(index) {
    return index >= 0 && index <= this.maxIndex
  }
}

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

// Display update utility functions using ANSI escape codes
const DisplayRenderer = {
  // ANSI escape codes for cursor positioning and display control
  ANSI: {
    CURSOR_UP: (lines) => `\u001b[${lines}A`,
    CURSOR_DOWN: (lines) => `\u001b[${lines}B`,
    CURSOR_TO_COLUMN: (col) => `\u001b[${col}G`,
    CLEAR_LINE: '\u001b[2K',
    CLEAR_FROM_CURSOR: '\u001b[0K',
    SAVE_CURSOR: '\u001b[s',
    RESTORE_CURSOR: '\u001b[u',
    HIDE_CURSOR: '\u001b[?25l',
    SHOW_CURSOR: '\u001b[?25h'
  },
  
  // Clear specified number of lines from current cursor position upward
  clearLines(lineCount) {
    if (lineCount <= 0) return
    
    // Move cursor up to start of area to clear
    process.stdout.write(this.ANSI.CURSOR_UP(lineCount))
    
    // Clear each line completely
    for (let i = 0; i < lineCount; i++) {
      process.stdout.write(this.ANSI.CLEAR_LINE)
      if (i < lineCount - 1) {
        process.stdout.write(this.ANSI.CURSOR_DOWN(1))
      }
    }
    
    // Return cursor to start position
    process.stdout.write(this.ANSI.CURSOR_UP(lineCount - 1))
  },
  
  // Render menu options with highlighting (maintains sumi aesthetic)
  renderMenuOptions(choices, selectedIndex, indentLevel = 6) {
    const lines = []
    
    choices.forEach((choice, index) => {
      const isSelected = index === selectedIndex
      const indent = brush.space.repeat(indentLevel)
      
      if (isSelected) {
        // Selected option: accent marker, bold number and text
        const marker = style(brush.dot, sumi.accent)
        const number = style(String(index + 1), sumi.bold)
        const label = style(choice.label, sumi.bold)
        lines.push(`${indent}${marker} ${number}. ${label}`)
      } else {
        // Unselected option: subtle styling
        const marker = style(brush.space, sumi.gray)
        const number = style(String(index + 1), sumi.dim)
        const label = style(choice.label, sumi.gray)
        lines.push(`${indent}${marker} ${number}. ${label}`)
      }
    })
    
    return lines
  },
  
  // Update display with smooth redrawing (prevents flickering)
  updateDisplay(newContent, previousLineCount = 0) {
    // Clear previous content if it exists
    if (previousLineCount > 0) {
      this.clearLines(previousLineCount)
    }
    
    // Render new content
    if (Array.isArray(newContent)) {
      newContent.forEach(line => {
        process.stdout.write(line + '\n')
      })
      return newContent.length
    } else {
      process.stdout.write(newContent)
      return newContent.split('\n').length - 1
    }
  },
  
  // Hide cursor during menu navigation to prevent visual artifacts
  hideCursor() {
    if (IS_INTERACTIVE) {
      process.stdout.write(this.ANSI.HIDE_CURSOR)
    }
  },
  
  // Show cursor when navigation is complete
  showCursor() {
    if (IS_INTERACTIVE) {
      process.stdout.write(this.ANSI.SHOW_CURSOR)
    }
  }
}

// Cleanup function for graceful shutdown
function cleanup() {
  // Ensure cursor is visible on exit
  DisplayRenderer.showCursor()
  // Readline interfaces handle their own cleanup via close()
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

// Enhanced choice function with keyboard navigation and numbered selection fallback
function askChoice(question, choices, defaultIndex = 0) {
  return new Promise((resolve) => {
    // Validate inputs
    if (!Array.isArray(choices) || choices.length === 0) {
      throw new Error('Choices must be a non-empty array')
    }
    
    if (defaultIndex < 0 || defaultIndex >= choices.length) {
      defaultIndex = 0
    }
    
    // Create a fresh readline interface for each choice
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    })
    
    // Initialize selection state
    const selectionState = new SelectionState(choices, defaultIndex)
    let isNavigating = false
    let displayLines = 0
    
    console.log(`${style(brush.space.repeat(4) + question, sumi.dim)}`)
    console.log('')
    
    // Enhanced display update function using ANSI escape codes for cursor positioning
    function renderChoices() {
      // Generate menu content with visual highlighting for currently selected option
      const menuLines = DisplayRenderer.renderMenuOptions(choices, selectionState.getCurrentIndex())
      
      // Add navigation instructions only on first render (maintains sumi aesthetic)
      const content = isNavigating ? menuLines : [
        ...menuLines,
        '', // Empty line for spacing
        `${brush.space.repeat(4)}Use ${style('↑↓', sumi.accent)} arrow keys to navigate, ${style('Enter', sumi.accent)} to select, or type ${style('1-' + choices.length, sumi.gray)}:`
      ]
      
      // Update display with smooth redrawing without flickering
      displayLines = DisplayRenderer.updateDisplay(content, isNavigating ? displayLines : 0)
    }
    
    // Handle Ctrl+C during choice selection with proper cleanup
    const handleSigInt = () => {
      // Ensure cursor is visible before exit
      DisplayRenderer.showCursor()
      console.log('')
      console.log(`${style(brush.space.repeat(4) + 'Selection cancelled.', sumi.dim)}`)
      readline.close()
      process.exit(0)
    }
    
    process.once('SIGINT', handleSigInt)
    
    // Function to complete the selection with proper cleanup
    function completeSelection(choiceIndex) {
      process.removeListener('SIGINT', handleSigInt)
      
      // Ensure cursor is visible
      DisplayRenderer.showCursor()
      
      // Clean up raw mode if it was enabled
      if (readline.input.setRawMode) {
        readline.input.setRawMode(false)
      }
      
      readline.close()
      
      // Show selection confirmation with sumi aesthetic
      console.log(`${style(brush.space.repeat(6) + 'Selected: ' + choices[choiceIndex].label, sumi.gray)}`)
      console.log('')
      resolve(choices[choiceIndex])
    }
    
    // Function to handle invalid input with clear error messages
    function handleInvalidInput(input, retryCallback) {
      console.log(`${style(brush.space.repeat(6) + `Invalid input "${input}". Please enter a number between 1 and ${choices.length}.`, sumi.warning)}`)
      
      // Provide helpful guidance
      if (choices.length <= 5) {
        console.log(`${style(brush.space.repeat(6) + 'Available options:', sumi.gray)}`)
        choices.forEach((choice, index) => {
          console.log(`${style(brush.space.repeat(8) + (index + 1) + '. ' + choice.label, sumi.gray)}`)
        })
      }
      console.log('')
      
      // Retry the input
      if (retryCallback) {
        retryCallback()
      }
    }
    
    // Detect environment capabilities for fallback handling
    const supportsRawMode = readline.input.setRawMode && process.stdin.isTTY
    const isInteractiveTerminal = IS_INTERACTIVE && process.stdin.isTTY
    
    // Try to enable raw mode for keyboard navigation
    let rawModeEnabled = false
    if (supportsRawMode && isInteractiveTerminal) {
      try {
        readline.input.setRawMode(true)
        rawModeEnabled = true
      } catch (error) {
        // Raw mode failed, fall back to numbered input only
        rawModeEnabled = false
        console.log(`${style(brush.space.repeat(6) + 'Keyboard navigation unavailable, using numbered input.', sumi.dim)}`)
      }
    }
    
    if (rawModeEnabled) {
      // Initial render for keyboard navigation mode
      renderChoices()
      
      // Hide cursor during navigation for cleaner visual experience
      DisplayRenderer.hideCursor()
      
      // Keyboard navigation mode with enhanced display rendering
      readline.input.on('data', (key) => {
        const keyStr = key.toString()
        
        // Handle different key inputs
        switch (keyStr) {
          case '\u001b[A': // Up arrow
            if (!isNavigating) {
              isNavigating = true
            }
            selectionState.moveUp()
            renderChoices()
            break
            
          case '\u001b[B': // Down arrow
            if (!isNavigating) {
              isNavigating = true
            }
            selectionState.moveDown()
            renderChoices()
            break
            
          case '\r': // Enter key
          case '\n': // Enter key (alternative)
            // Show cursor before completing selection
            DisplayRenderer.showCursor()
            completeSelection(selectionState.getCurrentIndex())
            break
            
          case '\u0003': // Ctrl+C
            // Show cursor before exit
            DisplayRenderer.showCursor()
            handleSigInt()
            break
            
          default:
            // Check if it's a number for fallback numbered selection
            const num = parseInt(keyStr)
            if (!isNaN(num) && num >= 1 && num <= choices.length) {
              // Show cursor before completing selection
              DisplayRenderer.showCursor()
              completeSelection(num - 1)
            }
            // Ignore other keys silently to prevent visual artifacts
            break
        }
      })
    } else {
      // Fallback to numbered input only (for non-TTY environments or when raw mode fails)
      const defaultChoice = defaultIndex + 1
      
      // Show choices in fallback mode
      choices.forEach((choice, index) => {
        const marker = index === defaultIndex ? style(brush.dot, sumi.accent) : style(brush.space, sumi.gray)
        const number = style(String(index + 1), index === defaultIndex ? sumi.bold : sumi.dim)
        const label = style(choice.label, index === defaultIndex ? sumi.bold : sumi.gray)
        console.log(`${brush.space.repeat(6)}${marker} ${number}. ${label}`)
      })
      console.log('')
      
      const promptText = `${brush.space.repeat(4)}Enter choice ${style(`(1-${choices.length})`, sumi.gray)} [${style(String(defaultChoice), sumi.bold)}]: `
      
      const askForInput = () => {
        readline.question(promptText, (answer) => {
          const trimmedAnswer = answer.trim()
          let choiceIndex
          
          if (!trimmedAnswer) {
            // Use default if no input
            choiceIndex = defaultIndex
            console.log(`${style(brush.space.repeat(6) + 'Using default: ' + choices[defaultIndex].label, sumi.gray)}`)
            completeSelection(choiceIndex)
          } else {
            const choice = parseInt(trimmedAnswer)
            
            if (isNaN(choice) || choice < 1 || choice > choices.length) {
              // Handle invalid input with clear error messages and retry
              handleInvalidInput(trimmedAnswer, askForInput)
            } else {
              choiceIndex = choice - 1
              completeSelection(choiceIndex)
            }
          }
        })
      }
      
      askForInput()
    }
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

# Giscus Comments
${enableComments.value ? `GISCUS_ENABLED=true` : `GISCUS_ENABLED=false`}
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
  cleanup()
  console.log('')
  console.log('')
  console.log(`${style(brush.space.repeat(4) + 'Setup cancelled by user.', sumi.dim)}`)
  console.log('')
  process.exit(0)
})

// Handle other termination signals for complete cleanup
process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})

process.on('exit', () => {
  // Ensure proper terminal cleanup
  cleanup()
})

// Run setup
runSetup()