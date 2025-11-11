import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'


import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'

import tailwindcss from '@tailwindcss/vite'

// Load environment variables from .env.local at config time
const env = loadEnv('development', process.cwd(), '')

// Get site URL with fallback
const siteUrl = env['SITE_URL'] || 'https://your-site.com'

export default defineConfig({
  site: siteUrl,
  base: '/astro-sumi',
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-light',
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noreferrer', 'noopener'],
        },
      ],
      rehypeHeadingIds,
      rehypeKatex,
    ],
    remarkPlugins: [remarkMath, remarkEmoji],
  },
})
