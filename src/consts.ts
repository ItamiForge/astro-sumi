import type { IconMap, SocialLink, Site, FontConfig } from '@/types'
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
  // Planned feature: Will be used when implementing pagination for /novels/[...page].astro
  // Currently all novels display on a single page. Pagination will be added when novel count grows.
  novelsPerPage: 6,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/novels',
    label: 'novels',
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

// Font Configuration - Single Source of Truth
// Add new fonts by adding one entry here. Everything else auto-generates.
export const FONTS: FontConfig = {
  geist: {
    id: 'geist',
    name: 'Geist',
    cssName: 'Geist',
    file: '/fonts/geist/geist.woff2',
    format: 'woff2-variations',
    variable: true,
    fallback: 'system-ui, sans-serif',
    default: true,
  },
  noto: {
    id: 'noto',
    name: 'Noto Sans',
    cssName: 'Noto Sans',
    file: '/fonts/noto-sans/noto-sans.woff2',
    format: 'woff2-variations',
    variable: true,
    fallback: 'sans-serif',
  },
  handwritten: {
    id: 'handwritten',
    name: 'Messy Handwritten',
    cssName: 'Messy Handwritten',
    file: '/fonts/messy-handwritten/messy-handwritten.ttf',
    format: 'truetype',
    variable: false,
    fallback: 'cursive, Comic Sans MS',
  },
} as const
