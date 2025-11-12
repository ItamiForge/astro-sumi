import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllNovels } from '@/lib/content/novels'

export async function GET(context: APIContext) {
  try {
    const novels = await getAllNovels()
    const siteUrl = context.site ?? SITE.href

    return rss({
      title: SITE.title,
      description: SITE.description,
      site: siteUrl,
      items: novels.map((novel) => ({
        title: novel.data.title,
        description: novel.data.description,
        pubDate: novel.data.startDate,
        link: new URL(`/novels/${novel.id}/`, siteUrl).href,
        author: novel.data.author || SITE.author,
      })),
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
