import { SITE } from '@/consts'
import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const manifest = {
    name: SITE.title,
    short_name: SITE.title,
    icons: [
      {
        src: '/web-app-manifest-192x192.webp',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'maskable',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#000000',
    display: 'standalone',
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}
