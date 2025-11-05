import { getCollection, type CollectionEntry } from 'astro:content'
import { calculateWordCountFromHtml, readingTime } from '../utils'
import { safeContentLoad, ContentError } from '../errors'
import { validateContentIntegrity } from '../validation'

export async function getAllNovels(): Promise<CollectionEntry<'novels'>[]> {
  return safeContentLoad(
    async () => {
      const novels = await getCollection('novels')
      
      // Validate content integrity
      const validNovels = validateContentIntegrity(
        novels,
        (novel) => {
          // Basic validation checks
          return !!(
            novel.id &&
            novel.data &&
            novel.data.title &&
            novel.data.author &&
            novel.data.startDate
          )
        },
        'novels'
      )
      
      return validNovels
        .filter((novel) => !novel.data.draft)
        .sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf())
    },
    [], // Empty array as fallback
    'getAllNovels'
  )
}

export async function getNovelById(novelId: string): Promise<CollectionEntry<'novels'> | null> {
  return safeContentLoad(
    async () => {
      const novels = await getAllNovels()
      const novel = novels.find((novel) => novel.id === novelId)
      
      if (!novel) {
        throw new ContentError(
          `Novel not found: ${novelId}`,
          'CONTENT_NOT_FOUND',
          { novelId }
        )
      }
      
      return novel
    },
    null, // null as fallback for not found
    'getNovelById',
    { novelId }
  )
}

export async function getNovelsByAuthor(authorId: string): Promise<CollectionEntry<'novels'>[]> {
  return safeContentLoad(
    async () => {
      const novels = await getAllNovels()
      return novels.filter((novel) => novel.data.author === authorId)
    },
    [], // Empty array as fallback
    'getNovelsByAuthor',
    { authorId }
  )
}

export async function getNovelsByTag(tag: string): Promise<CollectionEntry<'novels'>[]> {
  return safeContentLoad(
    async () => {
      const novels = await getAllNovels()
      return novels.filter((novel) => novel.data.tags?.includes(tag))
    },
    [], // Empty array as fallback
    'getNovelsByTag',
    { tag }
  )
}

export async function getRecentNovels(count: number): Promise<CollectionEntry<'novels'>[]> {
  return safeContentLoad(
    async () => {
      const novels = await getAllNovels()
      return novels.slice(0, count)
    },
    [], // Empty array as fallback
    'getRecentNovels',
    { count }
  )
}

export async function getAllTags(): Promise<Map<string, number>> {
  return safeContentLoad(
    async () => {
      const novels = await getAllNovels()
      return novels.reduce((acc, novel) => {
        novel.data.tags?.forEach((tag) => {
          acc.set(tag, (acc.get(tag) || 0) + 1)
        })
        return acc
      }, new Map<string, number>())
    },
    new Map<string, number>(), // Empty map as fallback
    'getAllTags'
  )
}

export async function getSortedTags(): Promise<{ tag: string; count: number }[]> {
  return safeContentLoad(
    async () => {
      const tagCounts = await getAllTags()
      return [...tagCounts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => {
          const countDiff = b.count - a.count
          return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
        })
    },
    [], // Empty array as fallback
    'getSortedTags'
  )
}

export async function getNovelReadingTime(novelId: string): Promise<string> {
  return safeContentLoad(
    async () => {
      const { getChaptersByNovel } = await import('./chapters')
      const chapters = await getChaptersByNovel(novelId)
      let totalWords = 0

      for (const chapter of chapters) {
        totalWords += calculateWordCountFromHtml(chapter.body)
      }

      return readingTime(totalWords)
    },
    '0 min read', // Fallback reading time
    'getNovelReadingTime',
    { novelId }
  )
}