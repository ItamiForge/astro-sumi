import { describe, test, expect } from 'vitest'
import { 
  formatDate, 
  calculateWordCountFromHtml, 
  readingTime, 
  getHeadingMargin,
  cn 
} from '@/lib/utils'

describe('Core Utility Functions', () => {
  describe('formatDate', () => {
    test('formats date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBe('January 15, 2024')
    })

    test('handles different months', () => {
      const date = new Date('2024-12-25')
      const formatted = formatDate(date)
      expect(formatted).toBe('December 25, 2024')
    })
  })

  describe('calculateWordCountFromHtml', () => {
    test('counts words in plain text', () => {
      const html = '<p>Hello world</p>'
      expect(calculateWordCountFromHtml(html)).toBe(2)
    })

    test('strips HTML tags and counts words', () => {
      const html = '<div><p>This is a <strong>test</strong> with <em>HTML</em> tags.</p></div>'
      expect(calculateWordCountFromHtml(html)).toBe(7)
    })

    test('handles empty or null input', () => {
      expect(calculateWordCountFromHtml('')).toBe(0)
      expect(calculateWordCountFromHtml(null)).toBe(0)
      expect(calculateWordCountFromHtml(undefined)).toBe(0)
    })

    test('handles multiple spaces and line breaks', () => {
      const html = '<p>Word1   word2\n\nword3</p>'
      expect(calculateWordCountFromHtml(html)).toBe(3)
    })

    test('handles complex HTML structure', () => {
      const html = `
        <article>
          <h1>Chapter Title</h1>
          <p>First paragraph with <a href="#">link</a> and <code>code</code>.</p>
          <blockquote>Quote text here</blockquote>
          <ul>
            <li>List item one</li>
            <li>List item two</li>
          </ul>
        </article>
      `
      expect(calculateWordCountFromHtml(html)).toBe(17)
    })
  })

  describe('readingTime', () => {
    test('calculates reading time for small word count', () => {
      expect(readingTime(100)).toBe('1 min read')
    })

    test('calculates reading time for larger word count', () => {
      expect(readingTime(400)).toBe('2 min read')
    })

    test('rounds reading time correctly', () => {
      expect(readingTime(250)).toBe('1 min read')
      expect(readingTime(350)).toBe('2 min read')
    })

    test('minimum reading time is 1 minute', () => {
      expect(readingTime(0)).toBe('1 min read')
      expect(readingTime(50)).toBe('1 min read')
    })

    test('handles large word counts', () => {
      expect(readingTime(2000)).toBe('10 min read')
    })
  })

  describe('getHeadingMargin', () => {
    test('returns correct margins for different heading depths', () => {
      expect(getHeadingMargin(3)).toBe('ml-4')
      expect(getHeadingMargin(4)).toBe('ml-8')
      expect(getHeadingMargin(5)).toBe('ml-12')
      expect(getHeadingMargin(6)).toBe('ml-16')
    })

    test('returns empty string for unsupported depths', () => {
      expect(getHeadingMargin(1)).toBe('')
      expect(getHeadingMargin(2)).toBe('')
      expect(getHeadingMargin(7)).toBe('')
    })
  })

  describe('cn (className utility)', () => {
    test('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    test('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    test('handles Tailwind merge conflicts', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
  })
})