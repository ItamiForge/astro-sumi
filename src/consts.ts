import type { IconMap, SocialLink, Site } from '@/types'
import { getSiteConfig, getSocialConfig } from '@/lib/env'

/**
 * Get site configuration using context-aware environment loading
 * This function works in both build and runtime contexts
 */
function createSiteConfig(): Site {
  // For build-time constants, we rely on the environment system's fallback to process.env
  // In Astro components, import.meta.env should be passed directly to getSiteConfig
  const siteConfig = getSiteConfig()
  
  return {
    title: siteConfig.title,
    description: siteConfig.description,
    href: siteConfig.url,
    author: siteConfig.author,
    locale: siteConfig.locale,
    featuredNovelCount: siteConfig.featuredNovelCount,
    novelsPerPage: siteConfig.novelsPerPage,
  }
}

// Create site configuration using context-aware environment loading
export const SITE: Site = createSiteConfig()

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

/**
 * Get social configuration using context-aware environment loading
 * This function works in both build and runtime contexts
 */
function createSocialLinks(): SocialLink[] {
  // For build-time constants, we rely on the environment system's fallback to process.env
  // In Astro components, import.meta.env should be passed directly to getSocialConfig
  const socialConfig = getSocialConfig()
  
  const links: SocialLink[] = []
  
  // Only add social links if they are configured (not using fallback URLs)
  if (socialConfig.githubUrl) {
    links.push({
      href: socialConfig.githubUrl,
      label: 'GitHub',
    })
  }
  
  if (socialConfig.emailAddress) {
    links.push({
      href: `mailto:${socialConfig.emailAddress}`,
      label: 'Email',
    })
  }
  
  if (socialConfig.patreonUrl) {
    links.push({
      href: socialConfig.patreonUrl,
      label: 'Patreon',
    })
  }
  
  if (socialConfig.kofiUrl) {
    links.push({
      href: socialConfig.kofiUrl,
      label: 'Ko-fi',
    })
  }
  
  // Always include RSS feed
  links.push({
    href: '/rss.xml',
    label: 'RSS',
  })
  
  return links
}

// Create social links using context-aware environment loading
export const SOCIAL_LINKS: SocialLink[] = createSocialLinks()

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:git-branch', // Using git-branch as GitHub brand icon is deprecated
  Email: 'lucide:mail',
  Patreon: 'lucide:user', // Using user icon for Patreon
  'Ko-fi': 'lucide:lightbulb', // Using lightbulb icon for Ko-fi
  RSS: 'lucide:rss',
}
