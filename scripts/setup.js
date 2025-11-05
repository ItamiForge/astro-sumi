#!/usr/bin/env node

/**
 * Astro Sumi Setup Script
 * 
 * Interactive CLI for configuring the Astro Sumi template with:
 * - Site configuration (name, author, description, theme)
 * - Giscus configuration wizard with option to disable comments entirely
 * - Content management options: keep sample novels, remove demo content, or start fresh
 * - Social links configuration (GitHub, email, Patreon, Ko-fi)
 * - Automatically generates .env.local with user's answers
 * - File cleanup based on user choices
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// ANSI color codes for better CLI experience
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * Utility function to ask questions with validation
 */
function askQuestion(question, options = {}) {
  return new Promise((resolve) => {
    const { defaultValue, validator, transform } = options
    
    const prompt = defaultValue 
      ? `${question} ${colors.dim}(${defaultValue})${colors.reset}: `
      : `${question}: `
    
    rl.question(prompt, (answer) => {
      let value = answer.trim() || defaultValue || ''
      
      if (transform) {
        value = transform(value)
      }
      
      if (validator && !validator(value)) {
        console.log(`${colors.red}Invalid input. Please try again.${colors.reset}`)
        resolve(askQuestion(question, options))
        return
      }
      
      resolve(value)
    })
  })
}

/**
 * Utility function to ask yes/no questions
 */
function askYesNo(question, defaultValue = false) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N'
  return askQuestion(`${question} ${colors.dim}(${defaultText})${colors.reset}`, {
    defaultValue: defaultValue ? 'y' : 'n',
    transform: (value) => value.toLowerCase(),
    validator: (value) => ['y', 'yes', 'n', 'no'].includes(value),
  }).then(answer => ['y', 'yes'].includes(answer))
}

/**
 * Utility function to ask multiple choice questions
 */
function askChoice(question, choices, defaultIndex = 0) {
  return new Promise((resolve) => {
    console.log(`\n${colors.bright}${question}${colors.reset}`)
    choices.forEach((choice, index) => {
      const marker = index === defaultIndex ? `${colors.green}>${colors.reset}` : ' '
      console.log(`${marker} ${index + 1}. ${choice.label}`)
      if (choice.description) {
        console.log(`   ${colors.dim}${choice.description}${colors.reset}`)
      }
    })
    
    rl.question(`\nEnter your choice (1-${choices.length}) [${defaultIndex + 1}]: `, (answer) => {
      const choice = parseInt(answer.trim()) || (defaultIndex + 1)
      if (choice < 1 || choice > choices.length) {
        console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`)
        resolve(askChoice(question, choices, defaultIndex))
        return
      }
      resolve(choices[choice - 1])
    })
  })
}

/**
 * Display welcome message
 */
function displayWelcome() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               ${colors.bright}🌸 Astro Sumi Setup${colors.reset}${colors.cyan}                ║
║                                                              ║
║  Welcome! This setup wizard will help you configure your    ║
║  novel publishing site with your personal information,      ║
║  comment system, and content preferences.                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}📝 What this setup will do:${colors.reset}
• Configure your site information (title, description, author)
• Set up comment system (Giscus or disable entirely)
• Configure social links (GitHub, email, etc.)
• Manage sample content (keep, remove, or start fresh)
• Generate .env.local file with your settings
• Clean up files based on your preferences

${colors.green}✨ Let's get started!${colors.reset}
`)
}

/**
 * Collect site configuration
 */
async function collectSiteConfig() {
  console.log(`\n${colors.bright}📖 Site Configuration${colors.reset}`)
  console.log(`${colors.dim}Configure your site's basic information${colors.reset}\n`)
  
  const siteTitle = await askQuestion('Site title', {
    defaultValue: 'Your Novel Site',
    validator: (value) => value.length > 0,
  })
  
  const siteDescription = await askQuestion('Site description', {
    defaultValue: 'A collection of my novels and stories',
    validator: (value) => value.length > 0,
  })
  
  const siteAuthor = await askQuestion('Author name', {
    defaultValue: 'Your Name',
    validator: (value) => value.length > 0,
  })
  
  const siteUrl = await askQuestion('Site URL (include https://)', {
    defaultValue: 'https://your-site.com',
    validator: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
  })
  
  return {
    title: siteTitle,
    description: siteDescription,
    author: siteAuthor,
    url: siteUrl,
  }
}

/**
 * Collect social links configuration
 */
async function collectSocialConfig() {
  console.log(`\n${colors.bright}🔗 Social Links Configuration${colors.reset}`)
  console.log(`${colors.dim}Configure your social media and contact links${colors.reset}\n`)
  
  const githubUrl = await askQuestion('GitHub profile URL (optional)', {
    defaultValue: '',
    validator: (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.hostname === 'github.com'
      } catch {
        return false
      }
    },
  })
  
  const emailAddress = await askQuestion('Email address (optional)', {
    defaultValue: '',
    validator: (value) => {
      if (!value) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
  })
  
  const patreonUrl = await askQuestion('Patreon URL (optional)', {
    defaultValue: '',
    validator: (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.hostname === 'www.patreon.com' || url.hostname === 'patreon.com'
      } catch {
        return false
      }
    },
  })
  
  const kofiUrl = await askQuestion('Ko-fi URL (optional)', {
    defaultValue: '',
    validator: (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.hostname === 'ko-fi.com'
      } catch {
        return false
      }
    },
  })
  
  return {
    githubUrl: githubUrl || undefined,
    emailAddress: emailAddress || undefined,
    patreonUrl: patreonUrl || undefined,
    kofiUrl: kofiUrl || undefined,
  }
}

/**
 * Collect Giscus configuration
 */
async function collectGiscusConfig() {
  console.log(`\n${colors.bright}💬 Comment System Configuration${colors.reset}`)
  console.log(`${colors.dim}Configure Giscus (GitHub Discussions) for comments${colors.reset}\n`)
  
  const enableComments = await askYesNo('Enable comment system?', true)
  
  if (!enableComments) {
    return { enabled: false }
  }
  
  console.log(`\n${colors.yellow}📋 Giscus Setup Instructions:${colors.reset}`)
  console.log(`1. Make sure your repository is public`)
  console.log(`2. Enable Discussions in your repository settings`)
  console.log(`3. Install the Giscus app: https://github.com/apps/giscus`)
  console.log(`4. Visit https://giscus.app to get your configuration`)
  console.log(`5. Enter the values below (or leave blank to use defaults)\n`)
  
  const repo = await askQuestion('Repository (username/repository-name)', {
    defaultValue: '',
    validator: (value) => {
      if (!value) return true
      return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(value)
    },
  })
  
  const repoId = await askQuestion('Repository ID (from giscus.app)', {
    defaultValue: '',
  })
  
  const category = await askQuestion('Discussion category', {
    defaultValue: 'General',
  })
  
  const categoryId = await askQuestion('Category ID (from giscus.app)', {
    defaultValue: '',
  })
  
  const theme = await askChoice('Comment theme', [
    { label: 'Light', value: 'light', description: 'Clean light theme' },
    { label: 'Dark', value: 'dark', description: 'Dark theme' },
    { label: 'Auto', value: 'preferred_color_scheme', description: 'Follows system theme' },
    { label: 'Transparent Dark', value: 'transparent_dark', description: 'Transparent dark theme' },
  ], 0)
  
  const language = await askChoice('Interface language', [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Russian', value: 'ru' },
    { label: 'Chinese (Simplified)', value: 'zh-CN' },
    { label: 'Chinese (Traditional)', value: 'zh-TW' },
  ], 0)
  
  return {
    enabled: true,
    repo: repo || undefined,
    repoId: repoId || undefined,
    category: category || 'General',
    categoryId: categoryId || undefined,
    theme: theme.value,
    language: language.value,
  }
}

/**
 * Collect content management preferences
 */
async function collectContentConfig() {
  console.log(`\n${colors.bright}📚 Content Management${colors.reset}`)
  console.log(`${colors.dim}Choose what to do with the sample content${colors.reset}\n`)
  
  const contentChoice = await askChoice('What would you like to do with sample content?', [
    { 
      label: 'Keep sample novels', 
      value: 'keep',
      description: 'Keep the demo novels as examples (recommended for first-time users)'
    },
    { 
      label: 'Remove demo content', 
      value: 'remove',
      description: 'Remove sample novels but keep the content structure'
    },
    { 
      label: 'Start completely fresh', 
      value: 'fresh',
      description: 'Remove all sample content and start with empty collections'
    },
  ], 0)
  
  return {
    contentStrategy: contentChoice.value,
  }
}

/**
 * Generate .env.local file
 */
function generateEnvFile(config) {
  const envContent = `# ============================================
# ASTRO SUMI - GENERATED CONFIGURATION
# ============================================
# 
# This file was generated by the setup script.
# You can modify these values or add additional configuration.
# 
# SECURITY WARNING: Never commit this file to version control!
# ============================================

# ============================================
# Site Configuration
# ============================================
SITE_TITLE="${config.site.title}"
SITE_DESCRIPTION="${config.site.description}"
SITE_AUTHOR="${config.site.author}"
SITE_URL="${config.site.url}"

# ============================================
# Social Links Configuration
# ============================================
${config.social.githubUrl ? `GITHUB_URL="${config.social.githubUrl}"` : '# GITHUB_URL=https://github.com/your-username'}
${config.social.emailAddress ? `EMAIL_ADDRESS="${config.social.emailAddress}"` : '# EMAIL_ADDRESS=author@example.com'}
${config.social.patreonUrl ? `PATREON_URL="${config.social.patreonUrl}"` : '# PATREON_URL=https://www.patreon.com/your-username'}
${config.social.kofiUrl ? `KOFI_URL="${config.social.kofiUrl}"` : '# KOFI_URL=https://ko-fi.com/your-username'}

# ============================================
# Comment System Configuration
# ============================================
${config.giscus.enabled ? 'COMMENTS_PROVIDER=giscus' : 'COMMENTS_PROVIDER=none'}
GISCUS_ENABLED=${config.giscus.enabled ? 'true' : 'false'}

${config.giscus.enabled ? `# Giscus Configuration
${config.giscus.repo ? `GISCUS_REPO="${config.giscus.repo}"` : '# GISCUS_REPO=your-username/your-repository'}
${config.giscus.repoId ? `GISCUS_REPO_ID="${config.giscus.repoId}"` : '# GISCUS_REPO_ID=R_kgDOH...'}
GISCUS_CATEGORY="${config.giscus.category}"
${config.giscus.categoryId ? `GISCUS_CATEGORY_ID="${config.giscus.categoryId}"` : '# GISCUS_CATEGORY_ID=DIC_kwDOH...'}
GISCUS_THEME="${config.giscus.theme}"
GISCUS_LANG="${config.giscus.language}"
GISCUS_MAPPING=pathname
GISCUS_REACTIONS_ENABLED=1
GISCUS_EMIT_METADATA=0
GISCUS_INPUT_POSITION=top
GISCUS_LOADING=lazy
GISCUS_STRICT=0` : '# Comments disabled - no Giscus configuration needed'}

# ============================================
# Build Configuration
# ============================================
NODE_ENV=development
ENABLE_ANALYTICS=false

# ============================================
# Setup Information
# ============================================
# Generated on: ${new Date().toISOString()}
# Content strategy: ${config.content.contentStrategy}
# Comments enabled: ${config.giscus.enabled}
`
  
  const envPath = join(projectRoot, '.env.local')
  writeFileSync(envPath, envContent, 'utf8')
  
  return envPath
}

/**
 * Clean up content based on user preferences
 */
function cleanupContent(contentStrategy) {
  const contentDir = join(projectRoot, 'src', 'content')
  
  if (contentStrategy === 'remove' || contentStrategy === 'fresh') {
    // Remove sample novels
    const novelsToRemove = [
      'chronicles-of-aethermoor.md',
      'whispers-in-the-void.md'
    ]
    
    novelsToRemove.forEach(novel => {
      const novelPath = join(contentDir, 'novels', novel)
      if (existsSync(novelPath)) {
        unlinkSync(novelPath)
        console.log(`${colors.dim}Removed: ${novel}${colors.reset}`)
      }
    })
    
    // Remove sample chapters
    const chaptersToRemove = [
      'chronicles-of-aethermoor-v1-c1.md',
      'chronicles-of-aethermoor-v1-c2.md',
      'whispers-in-the-void-v1-c1.md'
    ]
    
    chaptersToRemove.forEach(chapter => {
      const chapterPath = join(contentDir, 'chapters', chapter)
      if (existsSync(chapterPath)) {
        unlinkSync(chapterPath)
        console.log(`${colors.dim}Removed: ${chapter}${colors.reset}`)
      }
    })
  }
  
  if (contentStrategy === 'fresh') {
    // Remove sample author
    const authorPath = join(contentDir, 'authors', 'template-author.md')
    if (existsSync(authorPath)) {
      unlinkSync(authorPath)
      console.log(`${colors.dim}Removed: template-author.md${colors.reset}`)
    }
    
    // Create placeholder files to maintain structure
    const placeholderNovel = `---
title: "Your First Novel"
description: "Description of your novel"
author: "your-author-id"
publishedAt: ${new Date().toISOString().split('T')[0]}
status: "ongoing"
tags: ["fantasy", "adventure"]
coverImage: "/static/novel-cover.jpg"
---

# Your First Novel

Start writing your novel here...
`
    
    const placeholderChapter = `---
title: "Chapter 1: The Beginning"
description: "The first chapter of your story"
novel: "your-first-novel"
volume: 1
chapter: 1
publishedAt: ${new Date().toISOString().split('T')[0]}
wordCount: 0
---

# Chapter 1: The Beginning

Start writing your first chapter here...
`
    
    const placeholderAuthor = `---
name: "Your Name"
bio: "Author bio goes here"
avatar: "/static/author-placeholder.svg"
social:
  website: "https://your-website.com"
  email: "author@example.com"
---

# About the Author

Write your author bio here...
`
    
    writeFileSync(join(contentDir, 'novels', 'your-first-novel.md'), placeholderNovel, 'utf8')
    writeFileSync(join(contentDir, 'chapters', 'your-first-novel-v1-c1.md'), placeholderChapter, 'utf8')
    writeFileSync(join(contentDir, 'authors', 'your-author.md'), placeholderAuthor, 'utf8')
    
    console.log(`${colors.green}Created placeholder content files${colors.reset}`)
  }
}

/**
 * Display completion summary
 */
function displayCompletion(config, envPath) {
  console.log(`\n${colors.green}✅ Setup Complete!${colors.reset}`)
  console.log(`\n${colors.bright}📋 Configuration Summary:${colors.reset}`)
  console.log(`• Site: ${config.site.title}`)
  console.log(`• Author: ${config.site.author}`)
  console.log(`• URL: ${config.site.url}`)
  console.log(`• Comments: ${config.giscus.enabled ? 'Enabled (Giscus)' : 'Disabled'}`)
  console.log(`• Content: ${config.content.contentStrategy}`)
  
  console.log(`\n${colors.bright}📁 Files Created/Modified:${colors.reset}`)
  console.log(`• ${colors.cyan}.env.local${colors.reset} - Your environment configuration`)
  
  if (config.content.contentStrategy !== 'keep') {
    console.log(`• ${colors.dim}Sample content files removed/modified${colors.reset}`)
  }
  
  console.log(`\n${colors.bright}🚀 Next Steps:${colors.reset}`)
  console.log(`1. ${colors.cyan}npm run dev${colors.reset} - Start the development server`)
  console.log(`2. Visit ${colors.cyan}http://localhost:4321${colors.reset} to see your site`)
  
  if (config.giscus.enabled && (!config.giscus.repo || !config.giscus.repoId)) {
    console.log(`\n${colors.yellow}⚠️  Comment System Setup:${colors.reset}`)
    console.log(`To complete Giscus setup:`)
    console.log(`1. Visit ${colors.cyan}https://giscus.app${colors.reset}`)
    console.log(`2. Get your repository ID and category ID`)
    console.log(`3. Update the values in ${colors.cyan}.env.local${colors.reset}`)
  }
  
  console.log(`\n${colors.bright}📚 Documentation:${colors.reset}`)
  console.log(`• Check the README.md for detailed usage instructions`)
  console.log(`• Visit the docs/ folder for additional guides`)
  
  console.log(`\n${colors.magenta}Happy writing! 🌸${colors.reset}`)
}

/**
 * Main setup function
 */
async function runSetup() {
  try {
    displayWelcome()
    
    // Collect all configuration
    const siteConfig = await collectSiteConfig()
    const socialConfig = await collectSocialConfig()
    const giscusConfig = await collectGiscusConfig()
    const contentConfig = await collectContentConfig()
    
    const config = {
      site: siteConfig,
      social: socialConfig,
      giscus: giscusConfig,
      content: contentConfig,
    }
    
    console.log(`\n${colors.bright}🔧 Applying Configuration...${colors.reset}`)
    
    // Generate .env.local file
    const envPath = generateEnvFile(config)
    console.log(`${colors.green}✓${colors.reset} Generated .env.local`)
    
    // Clean up content based on preferences
    if (config.content.contentStrategy !== 'keep') {
      console.log(`${colors.yellow}📚 Managing content...${colors.reset}`)
      cleanupContent(config.content.contentStrategy)
      console.log(`${colors.green}✓${colors.reset} Content management complete`)
    }
    
    // Display completion summary
    displayCompletion(config, envPath)
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Setup failed:${colors.reset}`, error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Setup cancelled by user${colors.reset}`)
  rl.close()
  process.exit(0)
})

// Run the setup
runSetup()