import type { IconMap, SocialLink, Site } from '@/types'
import { getSiteConfig, getSocialConfig } from '@/lib/env'
import { loadEnv } from 'vite'

// Load environment variables from .env.local at module initialization time
const env = loadEnv('development', process.cwd(), '')

// Get site configuration from environment variables with fallbacks
const siteConfig = getSiteConfig(env)

export const SITE: Site = {
  title: siteConfig.title,
  description: siteConfig.description,
  href: siteConfig.url,
  author: siteConfig.author,
  locale: siteConfig.locale,
  featuredNovelCount: siteConfig.featuredNovelCount,
  novelsPerPage: siteConfig.novelsPerPage,
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

// Get social configuration from environment variables with fallbacks
const socialConfig = getSocialConfig(env)

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: socialConfig.githubUrl || 'https://github.com/your-username',
    label: 'GitHub',
  },
  {
    href: `mailto:${socialConfig.emailAddress || 'author@example.com'}`,
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:git-branch', // Using git-branch as GitHub brand icon is deprecated
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
