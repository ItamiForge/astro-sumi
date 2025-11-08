import { getCollection, render, type CollectionEntry } from 'astro:content'
import { calculateWordCountFromHtml, readingTime } from '../utils'
import { safeContentLoad, ContentError } from '../errors'
import { validateContentIntegrity } from '../validation'

export async function getAllChapters(): Promise<CollectionEntry<'chapters'>[]> {
  return safeContentLoad(
    async () => {
      const chapters = await getCollection('chapters')
      
      const validChapters = validateContentIntegrity(
        chapters,
        (chapter) => {
          return !!(
            chapter.id &&
            chapter.data &&
            chapter.data.title &&
            chapter.data.novel &&
            typeof chapter.data.volume === 'number' &&
            typeof chapter.data.chapter === 'number' &&
            chapter.data.publishDate
          )
        },
        'chapters'
      )
      
      return validChapters
        .filter((chapter) => !chapter.data.draft)
        .sort((a, b) => {
          if (a.data.novel !== b.data.novel) {
            return a.data.novel.localeCompare(b.data.novel)
          }
          if (a.data.volume !== b.data.volume) {
            return a.data.volume - b.data.volume
          }
          return a.data.chapter - b.data.chapter
        })
    },
    [],
    'getAllChapters'
  )
}

export async function getChaptersByNovel(novelId: string): Promise<CollectionEntry<'chapters'>[]> {
  return safeContentLoad(
    async () => {
      const chapters = await getAllChapters()
      return chapters
        .filter((chapter) => chapter.data.novel === novelId)
        .sort((a, b) => {
          if (a.data.volume !== b.data.volume) {
            return a.data.volume - b.data.volume
          }
          return a.data.chapter - b.data.chapter
        })
    },
    [],
    'getChaptersByNovel',
    { novelId }
  )
}

export async function getChapterById(chapterId: string): Promise<CollectionEntry<'chapters'> | null> {
  return safeContentLoad(
    async () => {
      const chapters = await getAllChapters()
      const chapter = chapters.find((chapter) => chapter.id === chapterId)
      
      if (!chapter) {
        throw new ContentError(
          `Chapter not found: ${chapterId}`,
          'CONTENT_NOT_FOUND',
          { chapterId }
        )
      }
      
      return chapter
    },
    null,
    'getChapterById',
    { chapterId }
  )
}

export async function getAdjacentChapters(currentChapterId: string): Promise<{
  newer: CollectionEntry<'chapters'> | null
  older: CollectionEntry<'chapters'> | null
}> {
  return safeContentLoad(
    async () => {
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
    },
    { newer: null, older: null },
    'getAdjacentChapters',
    { currentChapterId }
  )
}

export async function getChapterReadingTime(chapterId: string): Promise<string> {
  return safeContentLoad(
    async () => {
      const chapter = await getChapterById(chapterId)
      if (!chapter) return readingTime(0)

      const wordCount = calculateWordCountFromHtml(chapter.body)
      return readingTime(wordCount)
    },
    '0 min read',
    'getChapterReadingTime',
    { chapterId }
  )
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
}

export async function getChapterTOC(chapterId: string): Promise<TOCHeading[]> {
  return safeContentLoad(
    async () => {
      const chapter = await getChapterById(chapterId)
      if (!chapter) return []

      const { headings } = await render(chapter)
      return headings.map((heading) => ({
        slug: heading.slug,
        text: heading.text,
        depth: heading.depth,
      }))
    },
    [],
    'getChapterTOC',
    { chapterId }
  )
}