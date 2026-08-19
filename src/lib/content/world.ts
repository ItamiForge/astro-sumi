import { getCollection, type CollectionEntry } from 'astro:content'
import { parseWikiLinks, type WikiKind, wikiHref } from '@/lib/wiki/parse'
import { getChapterPath } from '@/lib/content/chapters'
import { safeContentLoad } from '../errors'
import { validateContentIntegrity } from '../validation'

export type WorldEntry =
  | CollectionEntry<'characters'>
  | CollectionEntry<'locations'>
  | CollectionEntry<'factions'>
  | CollectionEntry<'species'>
  | CollectionEntry<'maps'>
  | CollectionEntry<'terms'>
  | CollectionEntry<'events'>
  | CollectionEntry<'documents'>
  | CollectionEntry<'relics'>

export type WikiCard = {
  kind: WikiKind | 'map'
  slug: string
  name: string
  kicker?: string
  shortBio: string
  href: string
  novel?: string
  visibility?: string
}

export type CodexBacklink = {
  title: string
  href: string
  kicker: string
}

function isPublicEntity(entry: {
  data: { draft?: boolean; visibility?: string }
}): boolean {
  return !entry.data.draft && entry.data.visibility !== 'secret'
}

function isSpoilerSafe(entry: { data: { visibility?: string } }): boolean {
  return entry.data.visibility !== 'spoiler'
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

export async function getAllMaps(): Promise<CollectionEntry<'maps'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('maps')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'maps',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllMaps',
  )
}

export async function getAllTerms(): Promise<CollectionEntry<'terms'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('terms')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'terms',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllTerms',
  )
}

export async function getAllEvents(): Promise<CollectionEntry<'events'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('events')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'events',
      )
        .filter(isPublicEntity)
        .sort(
          (a, b) =>
            (a.data.sortKey ?? 0) - (b.data.sortKey ?? 0) ||
            a.data.name.localeCompare(b.data.name),
        )
    },
    [],
    'getAllEvents',
  )
}

export async function getAllDocuments(): Promise<
  CollectionEntry<'documents'>[]
> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('documents')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'documents',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllDocuments',
  )
}

export async function getAllRelics(): Promise<CollectionEntry<'relics'>[]> {
  return safeContentLoad(
    async () => {
      const entries = await getCollection('relics')
      return validateContentIntegrity(
        entries,
        (entry) => !!(entry.id && entry.data?.name && entry.data?.shortBio),
        'relics',
      )
        .filter(isPublicEntity)
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
    },
    [],
    'getAllRelics',
  )
}

export async function getTermById(id: string) {
  return (await getAllTerms()).find((entry) => entry.id === id) ?? null
}

export async function getEventById(id: string) {
  return (await getAllEvents()).find((entry) => entry.id === id) ?? null
}

export async function getDocumentById(id: string) {
  return (await getAllDocuments()).find((entry) => entry.id === id) ?? null
}

export async function getRelicById(id: string) {
  return (await getAllRelics()).find((entry) => entry.id === id) ?? null
}

export async function getMapById(id: string) {
  const maps = await getAllMaps()
  return maps.find((entry) => entry.id === id) ?? null
}

export async function getPinsForMap(mapId: string) {
  const locations = await getCollection('locations')
  return locations
    .filter(
      (location) =>
        !location.data.draft && location.data.visibility !== 'secret',
    )
    .filter((location) => location.data.coords?.map === mapId)
    .map((location) => ({
      id: location.id,
      name: location.data.name,
      kind: location.data.kind,
      x: location.data.coords?.x ?? 50,
      y: location.data.coords?.y ?? 50,
      visibility: location.data.visibility ?? 'public',
      href: wikiHref('location', location.id),
    }))
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
  return locations
    .filter(isSpoilerSafe)
    .filter((location) => location.data.parent === parentId)
}

export async function getCharactersByNovel(novelId: string) {
  const characters = await getAllCharacters()
  return characters
    .filter(isSpoilerSafe)
    .filter((entry) => entry.data.novel === novelId)
}

export async function getLocationsByNovel(novelId: string) {
  const locations = await getAllLocations()
  return locations
    .filter(isSpoilerSafe)
    .filter((entry) => entry.data.novel === novelId)
}

export async function getFactionsByNovel(novelId: string) {
  const factions = await getAllFactions()
  return factions
    .filter(isSpoilerSafe)
    .filter((entry) => entry.data.novel === novelId)
}

export async function getMapsByNovel(novelId: string) {
  const maps = await getAllMaps()
  return maps.filter((entry) => entry.data.novel === novelId)
}

export async function getWikiCardIndex(): Promise<WikiCard[]> {
  const [
    characters,
    locations,
    factions,
    species,
    terms,
    events,
    documents,
    relics,
  ] = await Promise.all([
    getAllCharacters(),
    getAllLocations(),
    getAllFactions(),
    getAllSpecies(),
    getAllTerms(),
    getAllEvents(),
    getAllDocuments(),
    getAllRelics(),
  ])

  const card = (
    kind: WikiKind,
    slug: string,
    name: string,
    kicker: string | undefined,
    shortBio: string,
    novel: string | undefined,
    visibility: string | undefined,
  ): WikiCard => ({
    kind,
    slug,
    name,
    kicker,
    shortBio,
    href: wikiHref(kind, slug),
    novel,
    visibility: visibility ?? 'public',
  })

  return [
    ...characters.map((entry) =>
      card(
        'character',
        entry.id,
        entry.data.name,
        entry.data.titles?.[0] ?? entry.data.role,
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...locations.map((entry) =>
      card(
        'location',
        entry.id,
        entry.data.name,
        entry.data.kind,
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...factions.map((entry) =>
      card(
        'faction',
        entry.id,
        entry.data.name,
        entry.data.kind,
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...species.map((entry) =>
      card(
        'species',
        entry.id,
        entry.data.name,
        'kindred',
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...terms.map((entry) =>
      card(
        'term',
        entry.id,
        entry.data.name,
        'glossary',
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...events.map((entry) =>
      card(
        'event',
        entry.id,
        entry.data.name,
        entry.data.era ?? 'annal',
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...documents.map((entry) =>
      card(
        'document',
        entry.id,
        entry.data.name,
        entry.data.kind,
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
    ...relics.map((entry) =>
      card(
        'relic',
        entry.id,
        entry.data.name,
        entry.data.kind,
        entry.data.shortBio,
        entry.data.novel,
        entry.data.visibility,
      ),
    ),
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

function mentionsSlug(
  body: string | undefined,
  slug: string,
  kind?: WikiKind,
): boolean {
  return mentionsFromMarkdown(body).some((mention) => {
    if (mention.slug !== slug) return false
    if (!kind || !mention.kind) return true
    return mention.kind === kind
  })
}

export async function backlinksForSlug(
  slug: string,
  kind?: WikiKind,
): Promise<CodexBacklink[]> {
  const [
    chapters,
    characters,
    locations,
    factions,
    species,
    terms,
    events,
    documents,
    relics,
  ] = await Promise.all([
    appearancesForSlug(slug, kind),
    getAllCharacters(),
    getAllLocations(),
    getAllFactions(),
    getAllSpecies(),
    getAllTerms(),
    getAllEvents(),
    getAllDocuments(),
    getAllRelics(),
  ])

  const links: CodexBacklink[] = chapters.map((chapter) => ({
    title: `Chapter ${chapter.data.chapter} · ${chapter.data.title}`,
    href: getChapterPath(chapter.data.novel, chapter),
    kicker: chapter.data.novel,
  }))

  const entries: { id: string; kind: WikiKind; name: string; body?: string }[] =
    [
      ...characters.map((entry) => ({
        id: entry.id,
        kind: 'character' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...locations.map((entry) => ({
        id: entry.id,
        kind: 'location' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...factions.map((entry) => ({
        id: entry.id,
        kind: 'faction' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...species.map((entry) => ({
        id: entry.id,
        kind: 'species' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...terms.map((entry) => ({
        id: entry.id,
        kind: 'term' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...events.map((entry) => ({
        id: entry.id,
        kind: 'event' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...documents.map((entry) => ({
        id: entry.id,
        kind: 'document' as const,
        name: entry.data.name,
        body: entry.body,
      })),
      ...relics.map((entry) => ({
        id: entry.id,
        kind: 'relic' as const,
        name: entry.data.name,
        body: entry.body,
      })),
    ]

  for (const entry of entries) {
    if (entry.id === slug && (!kind || entry.kind === kind)) continue
    if (!mentionsSlug(entry.body, slug, kind)) continue
    links.push({
      title: entry.name,
      href: wikiHref(entry.kind, entry.id),
      kicker: entry.kind,
    })
  }

  return links
}
