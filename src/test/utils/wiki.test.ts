import { describe, expect, test } from 'vitest'
import {
  normalizeKind,
  parseWikiLink,
  parseWikiLinks,
  slugifyWikiToken,
  wikiHref,
} from '@/lib/wiki/parse'
import { resolveWikiKind } from '@/lib/wiki/resolve'
import { rehypeWikiLinks, type HastNode } from '@/lib/wiki/rehype-wiki-links'
import { rehypeEpicAlerts } from '@/lib/wiki/rehype-epic-alerts'

describe('wiki parse', () => {
  test('parses unqualified, kinded, and labeled links', () => {
    const refs = parseWikiLinks(
      'Meet [[Kael]] and [[character:lyssa|the healer]] near [[location:thornhaven]].',
    )
    expect(refs).toHaveLength(3)
    expect(refs[0]).toMatchObject({
      kind: undefined,
      slug: 'kael',
      label: 'Kael',
    })
    expect(refs[1]).toMatchObject({
      kind: 'character',
      slug: 'lyssa',
      label: 'the healer',
    })
    expect(refs[2]).toMatchObject({
      kind: 'location',
      slug: 'thornhaven',
      label: 'thornhaven',
    })
  })

  test('normalizes kind aliases and slugs', () => {
    expect(normalizeKind('people')).toBe('character')
    expect(normalizeKind('places')).toBe('location')
    expect(normalizeKind('kindreds')).toBe('species')
    expect(normalizeKind('glossary')).toBe('term')
    expect(normalizeKind('annals')).toBe('event')
    expect(normalizeKind('library')).toBe('document')
    expect(normalizeKind('relics')).toBe('relic')
    expect(slugifyWikiToken('Kael the Elder')).toBe('kael-the-elder')
    expect(
      parseWikiLink('[[person:Kael the Elder|Kael the Elder]]')?.slug,
    ).toBe('kael-the-elder')
  })

  test('builds Codex hrefs', () => {
    expect(wikiHref('character', 'kael')).toBe('/codex/people/kael')
    expect(wikiHref('location', 'thornhaven', '/astro-sumi/')).toBe(
      '/astro-sumi/codex/places/thornhaven',
    )
    expect(wikiHref('term', 'the-bond')).toBe('/codex/glossary/the-bond')
    expect(wikiHref('event', 'the-first-awakening')).toBe(
      '/codex/annals/the-first-awakening',
    )
    expect(wikiHref('document', 'prophecy-of-the-five')).toBe(
      '/codex/library/prophecy-of-the-five',
    )
    expect(wikiHref('relic', 'kaels-spear')).toBe('/codex/relics/kaels-spear')
  })
})

describe('wiki resolve', () => {
  test('prefers explicit kind, then slug index', () => {
    const index = new Map([
      ['kael', 'character' as const],
      ['thornhaven', 'location' as const],
    ])
    expect(resolveWikiKind('faction', 'kael', index)).toBe('faction')
    expect(resolveWikiKind(undefined, 'thornhaven', index)).toBe('location')
    expect(resolveWikiKind(undefined, 'unknown', index)).toBeUndefined()
  })
})

describe('rehype wiki links', () => {
  test('turns wiki text into anchors inside nested html', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'div',
          children: [
            {
              type: 'element',
              tagName: 'p',
              children: [
                { type: 'text', value: '[[character:kael|Kael]] hunts.' },
              ],
            },
          ],
        },
      ],
    }

    rehypeWikiLinks({
      index: new Map([['kael', 'character']]),
    })(tree)

    const firstBlock = tree.children?.[0]
    const paragraph = firstBlock?.children?.[0]
    const anchor = paragraph?.children?.[0]
    expect(anchor?.tagName).toBe('a')
    expect(anchor?.properties?.['href']).toBe('/codex/people/kael')
    expect(anchor?.properties?.['data-wiki-slug']).toBe('kael')
    expect(anchor?.children?.[0]?.value).toBe('Kael')
  })

  test('skips code and marks unresolved unqualified links', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'code',
          children: [{ type: 'text', value: '[[kael]]' }],
        },
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'text', value: 'See [[ghost]]' }],
        },
      ],
    }

    rehypeWikiLinks({ index: new Map() })(tree)

    expect(tree.children?.[0]?.children?.[0]?.type).toBe('text')
    const paragraph = tree.children?.[1]
    const anchor = paragraph?.children?.find((node) => node.tagName === 'a')
    expect(anchor?.properties?.['data-wiki-missing']).toBe('true')
    expect(anchor?.properties?.['className'] as string[]).toContain(
      'wiki-link-missing',
    )
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
    expect(alert?.properties?.['className'] as string[]).toContain(
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
