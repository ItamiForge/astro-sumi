import type { IconMap, SocialLink, Site, FontConfig } from '@/types'

// Direct environment variable access - simpler and more predictable
// These are loaded at build/server start time from .env.local
const SITE_URL = import.meta.env.SITE_URL || 'https://your-site.com'
const SITE_TITLE = import.meta.env.SITE_TITLE || 'Astro Sumi'
const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION || 'A clean, minimal template specifically designed for novel and book writing projects'
const SITE_AUTHOR = import.meta.env.SITE_AUTHOR || 'Your Name'

export const SITE: Site = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  href: SITE_URL,
  author: SITE_AUTHOR,
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
    href: '/authors',
    label: 'authors',
  },
  {
    href: '/about',
    label: 'about',
  },
]

// Direct environment variable access for social links
const GITHUB_URL = import.meta.env.GITHUB_URL
const EMAIL_ADDRESS = import.meta.env.EMAIL_ADDRESS
const PATREON_URL = import.meta.env.PATREON_URL
const KOFI_URL = import.meta.env.KOFI_URL

// Build social links array - only include configured links
const socialLinks: SocialLink[] = []

if (GITHUB_URL) {
  socialLinks.push({ href: GITHUB_URL, label: 'GitHub' })
}

if (EMAIL_ADDRESS) {
  socialLinks.push({ href: `mailto:${EMAIL_ADDRESS}`, label: 'Email' })
}

if (PATREON_URL) {
  socialLinks.push({ href: PATREON_URL, label: 'Patreon' })
}

if (KOFI_URL) {
  socialLinks.push({ href: KOFI_URL, label: 'Ko-fi' })
}

// Always include RSS feed
socialLinks.push({ href: '/rss.xml', label: 'RSS' })

export const SOCIAL_LINKS: SocialLink[] = socialLinks

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
    file: '/fonts/GeistVF.woff2',
    format: 'woff2-variations',
    variable: true,
    fallback: 'system-ui, sans-serif',
    default: true,
  },
  noto: {
    id: 'noto',
    name: 'Noto Sans',
    cssName: 'Noto Sans',
    file: '/fonts/Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf',
    format: 'truetype-variations',
    variable: true,
    fallback: 'sans-serif',
  },
  handwritten: {
    id: 'handwritten',
    name: 'Messy Handwritten',
    cssName: 'Messy Handwritten',
    file: '/fonts/messy-handwritten/MessyHandwritten-Regular.ttf',
    format: 'truetype',
    variable: false,
    fallback: 'cursive, Comic Sans MS',
  },
} as const

