import { getCollection, render, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return await getCollection('authors')
}

export async function getAllNovels(): Promise<CollectionEntry<'novels'>[]> {
  const novels = await getCollection('novels')
  return novels
    .filter((novel) => !novel.data.draft)
    .sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf())
}

export async function getAllChapters(): Promise<CollectionEntry<'chapters'>[]> {
  const chapters = await getCollection('chapters')
  return chapters
    .filter((chapter) => !chapter.data.draft)
    .sort((a, b) => {
      // Sort by novel, then volume, then chapter
      if (a.data.novel !== b.data.novel) {
        return a.data.novel.localeCompare(b.data.novel)
      }
      if (a.data.volume !== b.data.volume) {
        return a.data.volume - b.data.volume
      }
      return a.data.chapter - b.data.chapter
    })
}

export async function getChaptersByNovel(novelId: string): Promise<CollectionEntry<'chapters'>[]> {
  const chapters = await getAllChapters()
  return chapters
    .filter((chapter) => chapter.data.novel === novelId)
    .sort((a, b) => {
      if (a.data.volume !== b.data.volume) {
        return a.data.volume - b.data.volume
      }
      return a.data.chapter - b.data.chapter
    })
}

export async function getNovelsByAuthor(authorId: string): Promise<CollectionEntry<'novels'>[]> {
  const novels = await getAllNovels()
  return novels.filter((novel) => novel.data.author === authorId)
}

export async function getChapterById(chapterId: string): Promise<CollectionEntry<'chapters'> | null> {
  const chapters = await getAllChapters()
  return chapters.find((chapter) => chapter.id === chapterId) || null
}

export async function getNovelById(novelId: string): Promise<CollectionEntry<'novels'> | null> {
  const novels = await getAllNovels()
  return novels.find((novel) => novel.id === novelId) || null
}

export async function getAllTags(): Promise<Map<string, number>> {
  const novels = await getAllNovels()
  return novels.reduce((acc, novel) => {
    novel.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getAdjacentChapters(currentChapterId: string): Promise<{
  newer: CollectionEntry<'chapters'> | null
  older: CollectionEntry<'chapters'> | null
}> {
  const currentChapter = await getChapterById(currentChapterId)
  if (!currentChapter) {
    return { newer: null, older: null }
  }

  const novelChapters = await getChaptersByNovel(currentChapter.data.novel)
  const currentIndex = novelChapters.findIndex((chapter) => chapter.id === currentChapterId)

  if (currentIndex === -1) {
    return { newer: null, older: null }
  }

  return {
    newer: currentIndex < novelChapters.length - 1 ? novelChapters[currentIndex + 1] : null,
    older: currentIndex > 0 ? novelChapters[currentIndex - 1] : null,
  }
}

export async function getNovelsByTag(
  tag: string,
): Promise<CollectionEntry<'novels'>[]> {
  const novels = await getAllNovels()
  return novels.filter((novel) => novel.data.tags?.includes(tag))
}

export async function getRecentNovels(
  count: number,
): Promise<CollectionEntry<'novels'>[]> {
  const novels = await getAllNovels()
  return novels.slice(0, count)
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()
  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export async function parseAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []

  const allAuthors = await getAllAuthors()
  const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

  return authorIds.map((id) => {
    const author = authorMap.get(id)
    return {
      id,
      name: author?.data?.name || author?.data?.penName || id,
      avatar: author?.data?.avatar || '/static/author-placeholder.svg',
      isRegistered: !!author,
    }
  })
}

export async function getChapterReadingTime(chapterId: string): Promise<string> {
  const chapter = await getChapterById(chapterId)
  if (!chapter) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(chapter.body)
  return readingTime(wordCount)
}

export async function getNovelReadingTime(novelId: string): Promise<string> {
  const chapters = await getChaptersByNovel(novelId)
  let totalWords = 0

  for (const chapter of chapters) {
    totalWords += calculateWordCountFromHtml(chapter.body)
  }

  return readingTime(totalWords)
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
}

export async function getChapterTOC(chapterId: string): Promise<TOCHeading[]> {
  const chapter = await getChapterById(chapterId)
  if (!chapter) return []

  const { headings } = await render(chapter)
  return headings.map((heading) => ({
    slug: heading.slug,
    text: heading.text,
    depth: heading.depth,
  }))
}
