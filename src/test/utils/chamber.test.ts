import { describe, expect, test } from 'vitest'
import { rehypeEpicAlerts } from '@/lib/wiki/rehype-epic-alerts'
import type { HastNode } from '@/lib/wiki/rehype-wiki-links'
import {
  isAtmosphere,
  isReadingLeading,
  isReadingMeasure,
  isReadingSize,
} from '@/lib/reading'

describe('reading settings', () => {
  test('accepts known tokens and rejects others', () => {
    expect(isReadingSize('lg')).toBe(true)
    expect(isReadingSize('xxl')).toBe(false)
    expect(isReadingMeasure('narrow')).toBe(true)
    expect(isReadingLeading('loose')).toBe(true)
    expect(isAtmosphere('starlight')).toBe(true)
    expect(isAtmosphere('neon')).toBe(false)
  })
})

describe('rehype epic alerts', () => {
  test('converts GitHub-style prophecy blockquotes', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'blockquote',
          children: [
            {
              type: 'element',
              tagName: 'p',
              children: [
                {
                  type: 'text',
                  value: '[!PROPHECY]\nFive names will wake.',
                },
              ],
            },
          ],
        },
      ],
    }

    rehypeEpicAlerts()(tree)

    const alert = tree.children?.[0]
    expect(alert?.tagName).toBe('aside')
    expect(alert?.properties?.['data-alert']).toBe('prophecy')
    expect((alert?.properties?.['className'] as string[])).toContain(
      'epic-alert-prophecy',
    )
    expect(alert?.children?.[0]?.children?.[0]?.value).toBe('Prophecy')
    expect(alert?.children?.[1]?.children?.[0]?.value).toBe(
      'Five names will wake.',
    )
  })

  test('leaves ordinary blockquotes alone', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'blockquote',
          children: [
            {
              type: 'element',
              tagName: 'p',
              children: [{ type: 'text', value: 'Just a quote.' }],
            },
          ],
        },
      ],
    }

    rehypeEpicAlerts()(tree)
    expect(tree.children?.[0]?.tagName).toBe('blockquote')
  })
})
