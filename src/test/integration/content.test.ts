import { describe, test, expect } from 'vitest'
import {
  getAllNovels,
  getNovelsByAuthor,
  getNovelById,
  getAllTags,
  getNovelsByTag,
  getNovelReadingTime
} from '@/lib/content/novels'
import {
  getAllChapters,
  getChaptersByNovel,
  getAdjacentChapters,
  getChapterById,
  getChapterReadingTime,
  getChapterTOC
} from '@/lib/content/chapters'
import {
  getAllAuthors,
  parseAuthors
} from '@/lib/content/authors'

describe('Content Collection Integration Tests', () => {
  describe('Basic Content Queries', () => {
    test('getAllNovels returns array of novels', async () => {
      const novels = await getAllNovels()
      expect(Array.isArray(novels)).toBe(true)
      expect(novels.length).toBeGreaterThan(0)
      
      // Verify novel structure
      const novel = novels[0]
      expect(novel).toHaveProperty('id')
      expect(novel).toHaveProperty('data')
      expect(novel.data).toHaveProperty('title')
      expect(novel.data).toHaveProperty('author')
      expect(novel.data).toHaveProperty('startDate')
    })

    test('getAllChapters returns array of chapters', async () => {
      const chapters = await getAllChapters()
      expect(Array.isArray(chapters)).toBe(true)
      expect(chapters.length).toBeGreaterThan(0)
      
      // Verify chapter structure
      const chapter = chapters[0]
      expect(chapter).toHaveProperty('id')
      expect(chapter).toHaveProperty('data')
      expect(chapter.data).toHaveProperty('title')
      expect(chapter.data).toHaveProperty('novel')
      expect(chapter.data).toHaveProperty('volume')
      expect(chapter.data).toHaveProperty('chapter')
    })

    test('getAllAuthors returns array of authors', async () => {
      const authors = await getAllAuthors()
      expect(Array.isArray(authors)).toBe(true)
      expect(authors.length).toBeGreaterThan(0)
      
      // Verify author structure
      const author = authors[0]
      expect(author).toHaveProperty('id')
      expect(author).toHaveProperty('data')
      expect(author.data).toHaveProperty('name')
    })
  })

  describe('Content Relationship Functions', () => {
    test('getChaptersByNovel returns chapters for specific novel', async () => {
      const novels = await getAllNovels()
      expect(novels.length).toBeGreaterThan(0)
      
      const novelId = novels[0].id
      const chapters = await getChaptersByNovel(novelId)
      
      expect(Array.isArray(chapters)).toBe(true)
      // All chapters should belong to the specified novel
      chapters.forEach(chapter => {
        expect(chapter.data.novel).toBe(novelId)
      })
      
      // Chapters should be sorted by volume and chapter number
      if (chapters.length > 1) {
        for (let i = 1; i < chapters.length; i++) {
          const prev = chapters[i - 1]
          const curr = chapters[i]
          
          if (prev.data.volume === curr.data.volume) {
            expect(prev.data.chapter).toBeLessThanOrEqual(curr.data.chapter)
          } else {
            expect(prev.data.volume).toBeLessThan(curr.data.volume)
          }
        }
      }
    })

    test('getNovelsByAuthor returns novels for specific author', async () => {
      const authors = await getAllAuthors()
      expect(authors.length).toBeGreaterThan(0)
      
      const authorId = authors[0].id
      const novels = await getNovelsByAuthor(authorId)
      
      expect(Array.isArray(novels)).toBe(true)
      // All novels should belong to the specified author
      novels.forEach(novel => {
        expect(novel.data.author).toBe(authorId)
      })
    })

    test('getAdjacentChapters returns correct navigation', async () => {
      const chapters = await getAllChapters()
      expect(chapters.length).toBeGreaterThan(0)
      
      // Test with first chapter of a novel
      const firstChapter = chapters[0]
      const adjacent = await getAdjacentChapters(firstChapter.id)
      
      expect(adjacent).toHaveProperty('newer')
      expect(adjacent).toHaveProperty('older')
      
      // First chapter should have no older chapter
      expect(adjacent.older).toBeNull()
      
      // If there are more chapters in the same novel, newer should exist
      const novelChapters = await getChaptersByNovel(firstChapter.data.novel)
      if (novelChapters.length > 1) {
        expect(adjacent.newer).not.toBeNull()
        expect(adjacent.newer?.data.novel).toBe(firstChapter.data.novel)
      }
    })

    test('getAdjacentChapters handles non-existent chapter', async () => {
      const adjacent = await getAdjacentChapters('non-existent-chapter')
      expect(adjacent.newer).toBeNull()
      expect(adjacent.older).toBeNull()
    })
  })

  describe('Content Loading and Error Handling', () => {
    test('getChapterById returns chapter when found', async () => {
      const chapters = await getAllChapters()
      expect(chapters.length).toBeGreaterThan(0)
      
      const chapterId = chapters[0].id
      const chapter = await getChapterById(chapterId)
      
      expect(chapter).not.toBeNull()
      expect(chapter?.id).toBe(chapterId)
    })

    test('getChapterById returns null when not found', async () => {
      const chapter = await getChapterById('non-existent-chapter')
      expect(chapter).toBeNull()
    })

    test('getNovelById returns novel when found', async () => {
      const novels = await getAllNovels()
      expect(novels.length).toBeGreaterThan(0)
      
      const novelId = novels[0].id
      const novel = await getNovelById(novelId)
      
      expect(novel).not.toBeNull()
      expect(novel?.id).toBe(novelId)
    })

    test('getNovelById returns null when not found', async () => {
      const novel = await getNovelById('non-existent-novel')
      expect(novel).toBeNull()
    })

    test('getChaptersByNovel handles non-existent novel', async () => {
      const chapters = await getChaptersByNovel('non-existent-novel')
      expect(Array.isArray(chapters)).toBe(true)
      expect(chapters.length).toBe(0)
    })

    test('getNovelsByAuthor handles non-existent author', async () => {
      const novels = await getNovelsByAuthor('non-existent-author')
      expect(Array.isArray(novels)).toBe(true)
      expect(novels.length).toBe(0)
    })
  })

  describe('Advanced Content Operations', () => {
    test('getAllTags returns tag map with counts', async () => {
      const tags = await getAllTags()
      expect(tags instanceof Map).toBe(true)
      
      // Verify tag counts are positive numbers
      for (const [tag, count] of tags.entries()) {
        expect(typeof tag).toBe('string')
        expect(typeof count).toBe('number')
        expect(count).toBeGreaterThan(0)
      }
    })

    test('getNovelsByTag returns novels with specific tag', async () => {
      const allTags = await getAllTags()
      if (allTags.size > 0) {
        const firstTag = Array.from(allTags.keys())[0]
        const novels = await getNovelsByTag(firstTag)
        
        expect(Array.isArray(novels)).toBe(true)
        // All novels should have the specified tag
        novels.forEach(novel => {
          expect(novel.data.tags).toContain(firstTag)
        })
      }
    })

    test('parseAuthors handles valid author IDs', async () => {
      const authors = await getAllAuthors()
      if (authors.length > 0) {
        const authorIds = [authors[0].id]
        const parsedAuthors = await parseAuthors(authorIds)
        
        expect(Array.isArray(parsedAuthors)).toBe(true)
        expect(parsedAuthors.length).toBe(1)
        expect(parsedAuthors[0]).toHaveProperty('id')
        expect(parsedAuthors[0]).toHaveProperty('name')
        expect(parsedAuthors[0]).toHaveProperty('isRegistered')
        expect(parsedAuthors[0].isRegistered).toBe(true)
      }
    })

    test('parseAuthors handles invalid author IDs', async () => {
      const parsedAuthors = await parseAuthors(['non-existent-author'])
      
      expect(Array.isArray(parsedAuthors)).toBe(true)
      expect(parsedAuthors.length).toBe(1)
      expect(parsedAuthors[0].id).toBe('non-existent-author')
      expect(parsedAuthors[0].isRegistered).toBe(false)
    })

    test('getChapterReadingTime calculates reading time', async () => {
      const chapters = await getAllChapters()
      if (chapters.length > 0) {
        const readingTime = await getChapterReadingTime(chapters[0].id)
        expect(typeof readingTime).toBe('string')
        expect(readingTime).toMatch(/\d+ min read/)
      }
    })

    test('getChapterReadingTime handles non-existent chapter', async () => {
      const readingTime = await getChapterReadingTime('non-existent-chapter')
      expect(readingTime).toBe('1 min read') // Default fallback
    })

    test('getNovelReadingTime calculates total reading time', async () => {
      const novels = await getAllNovels()
      if (novels.length > 0) {
        const readingTime = await getNovelReadingTime(novels[0].id)
        expect(typeof readingTime).toBe('string')
        expect(readingTime).toMatch(/\d+ min read/)
      }
    })

    test('getChapterTOC returns table of contents', async () => {
      const chapters = await getAllChapters()
      if (chapters.length > 0) {
        const toc = await getChapterTOC(chapters[0].id)
        expect(Array.isArray(toc)).toBe(true)
        
        // If TOC has entries, verify structure
        toc.forEach(heading => {
          expect(heading).toHaveProperty('slug')
          expect(heading).toHaveProperty('text')
          expect(heading).toHaveProperty('depth')
          expect(typeof heading.depth).toBe('number')
        })
      }
    })

    test('getChapterTOC handles non-existent chapter', async () => {
      const toc = await getChapterTOC('non-existent-chapter')
      expect(Array.isArray(toc)).toBe(true)
      expect(toc.length).toBe(0)
    })
  })
})