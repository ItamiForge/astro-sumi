export const WIKI_KINDS = [
  'character',
  'location',
  'faction',
  'species',
  'term',
  'event',
  'document',
  'relic',
] as const

export type WikiKind = (typeof WIKI_KINDS)[number]

export type WikiRef = {
  kind?: WikiKind
  slug: string
  label: string
  raw: string
}

export const KIND_ROUTE: Record<WikiKind, string> = {
  character: 'people',
  location: 'places',
  faction: 'factions',
  species: 'kindreds',
  term: 'glossary',
  event: 'annals',
  document: 'library',
  relic: 'relics',
}

const KIND_ALIASES: Record<string, WikiKind> = {
  character: 'character',
  characters: 'character',
  person: 'character',
  people: 'character',
  location: 'location',
  locations: 'location',
  place: 'location',
  places: 'location',
  faction: 'faction',
  factions: 'faction',
  house: 'faction',
  order: 'faction',
  species: 'species',
  kindred: 'species',
  kindreds: 'species',
  term: 'term',
  terms: 'term',
  glossary: 'term',
  event: 'event',
  events: 'event',
  annal: 'event',
  annals: 'event',
  document: 'document',
  documents: 'document',
  library: 'document',
  relic: 'relic',
  relics: 'relic',
}

/** [[kind:slug#anchor|label]] with kind and label optional */
export const WIKI_LINK_RE =
  /\[\[(?:([^\]|:]+):)?([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g

export function normalizeKind(kind: string | undefined): WikiKind | undefined {
  if (!kind) return undefined
  return KIND_ALIASES[kind.trim().toLowerCase()]
}

export function slugifyWikiToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseWikiLink(raw: string): WikiRef | null {
  const re = new RegExp(`^${WIKI_LINK_RE.source}$`)
  const match = re.exec(raw)
  if (!match) return null
  return refFromMatch(match)
}

export function parseWikiLinks(text: string): WikiRef[] {
  const refs: WikiRef[] = []
  const re = new RegExp(WIKI_LINK_RE.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    refs.push(refFromMatch(match))
  }
  return refs
}

function refFromMatch(match: RegExpExecArray): WikiRef {
  const kind = normalizeKind(match[1])
  const token = match[2]?.trim() ?? ''
  const label = (match[4] || token).trim()
  return {
    kind,
    slug: slugifyWikiToken(token),
    label,
    raw: match[0],
  }
}

export function wikiHref(kind: WikiKind, slug: string, base = '/'): string {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${cleanBase}/codex/${KIND_ROUTE[kind]}/${slug}`
}

export function accentFromSlug(slug: string): {
  hue: number
  background: string
  foreground: string
} {
  let hash = 0
  for (const char of slug) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return {
    hue,
    background: `oklch(0.42 0.08 ${hue})`,
    foreground: `oklch(0.96 0.02 ${hue})`,
  }
}
