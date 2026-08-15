import type { WikiKind } from './parse'
import { parseWikiLinks, wikiHref } from './parse'
import { resolveWikiKind, type WikiSlugIndex } from './resolve'

export type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const SKIP_TAGS = new Set(['code', 'pre', 'a', 'script', 'style', 'textarea'])

export function rehypeWikiLinks(options?: {
  base?: string
  index?: WikiSlugIndex
}) {
  const base = options?.base ?? '/'

  return function transformer(tree: HastNode) {
    walk(tree, options?.index, base)
  }
}

function walk(node: HastNode, index: WikiSlugIndex | undefined, base: string) {
  if (node.tagName && SKIP_TAGS.has(node.tagName)) return
  if (!node.children) return

  const next: HastNode[] = []
  for (const child of node.children) {
    if (child.type === 'text' && child.value && child.value.includes('[[')) {
      next.push(...splitTextNode(child.value, index, base))
    } else {
      walk(child, index, base)
      next.push(child)
    }
  }
  node.children = next
}

function splitTextNode(
  value: string,
  index: WikiSlugIndex | undefined,
  base: string,
): HastNode[] {
  const refs = parseWikiLinks(value)
  if (refs.length === 0) return [{ type: 'text', value }]

  const nodes: HastNode[] = []
  let cursor = 0
  for (const ref of refs) {
    const start = value.indexOf(ref.raw, cursor)
    if (start === -1) continue
    if (start > cursor) {
      nodes.push({ type: 'text', value: value.slice(cursor, start) })
    }

    const kind = resolveWikiKind(ref.kind, ref.slug, index)
    nodes.push(wikiAnchor(kind, ref.slug, ref.label, base))
    cursor = start + ref.raw.length
  }

  if (cursor < value.length) {
    nodes.push({ type: 'text', value: value.slice(cursor) })
  }

  return nodes
}

function wikiAnchor(
  kind: WikiKind | undefined,
  slug: string,
  label: string,
  base: string,
): HastNode {
  const resolvedKind: WikiKind = kind ?? 'character'
  const missing = !kind
  const className = missing ? ['wiki-link', 'wiki-link-missing'] : ['wiki-link']

  return {
    type: 'element',
    tagName: 'a',
    properties: {
      href: wikiHref(resolvedKind, slug, base),
      className,
      'data-wiki-kind': resolvedKind,
      'data-wiki-slug': slug,
      ...(missing ? { 'data-wiki-missing': 'true' } : {}),
    },
    children: [{ type: 'text', value: label }],
  }
}
