import { getCollection, type CollectionEntry } from 'astro:content'
import { parseWikiLinks, type WikiKind, wikiHref } from '@/lib/wiki/parse'
import { safeContentLoad } from '../errors'
import { validateContentIntegrity } from '../validation'

export type WorldEntry =
  | CollectionEntry<'characters'>
  | CollectionEntry<'locations'>
  | CollectionEntry<'factions'>
  | CollectionEntry<'species'>

export type WikiCard = {
  kind: WikiKind
  slug: string
  name: string
  kicker?: string
  shortBio: string
  href: string
  novel?: string
}

function isPublicEntity(entry: {
  data: { draft?: boolean; visibility?: string }
}): boolean {
  return !entry.data.draft && entry.data.visibility !== 'secret'
}

export async function getAllCharacters(): Promise<
  CollectionEntry<'characters'>[]
> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('characters')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'characters',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllCharacters',
  )
}

export async function getAllLocations(): Promise<
  CollectionEntry<'locations'>[]
> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('locations')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'locations',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllLocations',
  )
}

export async function getAllFactions(): Promise<CollectionEntry<'factions'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('factions')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'factions',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllFactions',
  )
}

export async function getAllSpecies(): Promise<CollectionEntry<'species'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('species')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'species',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllSpecies',
  )
}

export async function getCharacterById(id: string) {
  const entries = await getAllCharacters()
  return entries.find((entry) => entry.id === id) ?? null
}

export async function getLocationById(id: string) {
  const entries = await getAllLocations()
  return entries.find((entry) => entry.id === id) ?? null
}

export async function getFactionById(id: string) {
  const entries = await getAllFactions()
  return entries.find((entry) => entry.id === id) ?? null
}

export async function getSpeciesById(id: string) {
  const entries = await getAllSpecies()
  return entries.find((entry) => entry.id === id) ?? null
}

export async function getChildLocations(parentId: string) {
  const locations = await getAllLocations()
  return locations.filter((location) => location.data.parent === parentId)
}

export async function getCharactersByNovel(novelId: string) {
  const characters = await getAllCharacters()
  return characters.filter((entry) => entry.data.novel === novelId)
}

export async function getLocationsByNovel(novelId: string) {
  const locations = await getAllLocations()
  return locations.filter((entry) => entry.data.novel === novelId)
}

export async function getFactionsByNovel(novelId: string) {
  const factions = await getAllFactions()
  return factions.filter((entry) => entry.data.novel === novelId)
}

export async function getWikiCardIndex(): Promise<WikiCard[]> {
  const [characters, locations, factions, species] = await Promise.all([
    getAllCharacters(),
    getAllLocations(),
    getAllFactions(),
    getAllSpecies(),
  ])

  return [
    ...characters.map((entry) => ({
      kind: 'character' as const,
      slug: entry.id,
      name: entry.data.name,
      kicker: entry.data.titles?.[0] ?? entry.data.role,
      shortBio: entry.data.shortBio,
      href: wikiHref('character', entry.id),
      novel: entry.data.novel,
    })),
    ...locations.map((entry) => ({
      kind: 'location' as const,
      slug: entry.id,
      name: entry.data.name,
      kicker: entry.data.kind,
      shortBio: entry.data.shortBio,
      href: wikiHref('location', entry.id),
      novel: entry.data.novel,
    })),
    ...factions.map((entry) => ({
      kind: 'faction' as const,
      slug: entry.id,
      name: entry.data.name,
      kicker: entry.data.kind,
      shortBio: entry.data.shortBio,
      href: wikiHref('faction', entry.id),
      novel: entry.data.novel,
    })),
    ...species.map((entry) => ({
      kind: 'species' as const,
      slug: entry.id,
      name: entry.data.name,
      kicker: 'kindred',
      shortBio: entry.data.shortBio,
      href: wikiHref('species', entry.id),
      novel: entry.data.novel,
    })),
  ]
}

export function mentionsFromMarkdown(markdown: string | undefined): {
  kind?: WikiKind
  slug: string
}[] {
  if (!markdown) return []
  const seen = new Set<string>()
  const mentions: { kind?: WikiKind; slug: string }[] = []
  for (const ref of parseWikiLinks(markdown)) {
    const key = `${ref.kind ?? ''}:${ref.slug}`
    if (seen.has(key)) continue
    seen.add(key)
    mentions.push({ kind: ref.kind, slug: ref.slug })
  }
  return mentions
}

export async function cardsForMentions(
  markdown: string | undefined,
): Promise<WikiCard[]> {
  const mentions = mentionsFromMarkdown(markdown)
  if (mentions.length === 0) return []
  const index = await getWikiCardIndex()
  const cards: WikiCard[] = []
  const used = new Set<string>()

  for (const mention of mentions) {
    const card = index.find((item) => {
      if (item.slug !== mention.slug) return false
      if (!mention.kind) return true
      return item.kind === mention.kind
    })
    if (!card) continue
    const key = `${card.kind}:${card.slug}`
    if (used.has(key)) continue
    used.add(key)
    cards.push(card)
  }

  return cards
}

export async function appearancesForSlug(slug: string, kind?: WikiKind) {
  const chapters = await getCollection('chapters')
  return chapters
    .filter((chapter) => !chapter.data.draft)
    .filter((chapter) => {
      const mentions = mentionsFromMarkdown(chapter.body)
      return mentions.some((mention) => {
        if (mention.slug !== slug) return false
        if (!kind || !mention.kind) return true
        return mention.kind === kind
      })
    })
    .sort((a, b) => {
      if (a.data.novel !== b.data.novel) {
        return a.data.novel.localeCompare(b.data.novel)
      }
      if (a.data.volume !== b.data.volume) return a.data.volume - b.data.volume
      return a.data.chapter - b.data.chapter
    })
}
