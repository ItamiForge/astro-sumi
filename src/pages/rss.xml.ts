import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllNovels } from '@/lib/data-utils'

export async function GET(context: APIContext) {
  try {
    const novels = await getAllNovels()

    return rss({
      title: SITE.title,
      description: SITE.description,
      site: context.site ?? SITE.href,
      items: novels.map((novel) => ({
        title: novel.data.title,
        description: novel.data.description,
        pubDate: novel.data.startDate,
        link: `/novels/${novel.id}/`,
      })),
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
