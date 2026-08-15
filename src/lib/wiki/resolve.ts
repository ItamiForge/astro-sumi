import fs from 'node:fs'
import path from 'node:path'
import type { WikiKind } from './parse'
import { WIKI_KINDS } from './parse'

const KIND_DIRS: Record<WikiKind, string> = {
  character: 'characters',
  location: 'locations',
  faction: 'factions',
  species: 'species',
}

export type WikiSlugIndex = Map<string, WikiKind>

let cachedIndex: WikiSlugIndex | null = null

export function loadWikiSlugIndex(
  contentRoot = path.join(process.cwd(), 'src/content'),
): WikiSlugIndex {
  if (cachedIndex && process.env['NODE_ENV'] === 'production') return cachedIndex

  const index: WikiSlugIndex = new Map()
  for (const kind of WIKI_KINDS) {
    const dir = path.join(contentRoot, KIND_DIRS[kind])
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue
      const slug = file.replace(/\.mdx?$/, '')
      if (!index.has(slug)) index.set(slug, kind)
    }
  }

  cachedIndex = index
  return index
}

export function resolveWikiKind(
  kind: WikiKind | undefined,
  slug: string,
  index?: WikiSlugIndex,
): WikiKind | undefined {
  if (kind) return kind
  return (index ?? loadWikiSlugIndex()).get(slug)
}

export function resetWikiSlugIndexCache() {
  cachedIndex = null
}
