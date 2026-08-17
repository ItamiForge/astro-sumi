import type { IconMap, SocialLink, Site } from '@/types'
import { siteConfig, socialLinks } from '@/lib/env'

// Use validated environment configuration from src/lib/env.ts
// This provides type-safe, validated access to environment variables with helpful error messages
export const SITE: Site = {
  title: siteConfig.title,
  description: siteConfig.description,
  href: siteConfig.url,
  author: siteConfig.author,
  locale: 'en-US',
  featuredNovelCount: 3,
  novelsPerPage: 6,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/novels',
    label: 'novels',
  },
  {
    href: '/codex',
    label: 'codex',
  },
  {
    href: '/authors',
    label: 'authors',
  },
  {
    href: '/about',
    label: 'about',
  },
]

// Build social links array from validated environment - only include configured links
const buildSocialLinks = (): SocialLink[] => {
  const links: SocialLink[] = []

  if (socialLinks.github) {
    links.push({ href: socialLinks.github, label: 'GitHub' })
  }

  if (socialLinks.email) {
    links.push({ href: `mailto:${socialLinks.email}`, label: 'Email' })
  }

  if (socialLinks.patreon) {
    links.push({ href: socialLinks.patreon, label: 'Patreon' })
  }

  if (socialLinks.kofi) {
    links.push({ href: socialLinks.kofi, label: 'Ko-fi' })
  }

  // Always include RSS feed
  links.push({ href: '/rss.xml', label: 'RSS' })

  return links
}

export const SOCIAL_LINKS: SocialLink[] = buildSocialLinks()

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:git-branch', // Using git-branch as GitHub brand icon is deprecated
  Email: 'lucide:mail',
  Patreon: 'lucide:user', // Using user icon for Patreon
  'Ko-fi': 'lucide:lightbulb', // Using lightbulb icon for Ko-fi
  RSS: 'lucide:rss',
}
