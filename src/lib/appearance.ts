/**
 * Site-wide appearance: named palettes and type pairings.
 *
 * html[data-palette] restyles color tokens. html[data-type] sets
 * --font-ui / --font-display / --font-body. Palettes own light/dark
 * (data-theme + color-scheme) so there is no separate theme toggle.
 */
import { READING_KEYS, storedOrDefault } from '@/lib/reading'

export const PALETTES = [
  {
    id: 'ink',
    name: 'Ink',
    scheme: 'light',
    swatch: 'oklch(0.99 0.002 90)',
    ink: 'oklch(0.22 0.01 70)',
  },
  {
    id: 'paper',
    name: 'Paper',
    scheme: 'light',
    swatch: 'oklch(0.95 0.03 85)',
    ink: 'oklch(0.28 0.04 55)',
  },
  {
    id: 'silk',
    name: 'Silk',
    scheme: 'light',
    swatch: 'oklch(0.975 0.012 350)',
    ink: 'oklch(0.26 0.04 320)',
  },
  {
    id: 'garden',
    name: 'Garden',
    scheme: 'light',
    swatch: 'oklch(0.97 0.02 145)',
    ink: 'oklch(0.24 0.05 145)',
  },
  {
    id: 'caramel',
    name: 'Caramel',
    scheme: 'light',
    swatch: 'oklch(0.94 0.035 70)',
    ink: 'oklch(0.26 0.06 50)',
  },
  {
    id: 'night',
    name: 'Night',
    scheme: 'dark',
    swatch: 'oklch(0.16 0.01 260)',
    ink: 'oklch(0.93 0.01 260)',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    scheme: 'dark',
    swatch: 'oklch(0.20 0.03 50)',
    ink: 'oklch(0.91 0.03 80)',
  },
  {
    id: 'forest',
    name: 'Forest',
    scheme: 'dark',
    swatch: 'oklch(0.18 0.035 150)',
    ink: 'oklch(0.91 0.03 145)',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    scheme: 'dark',
    swatch: 'oklch(0.14 0.02 80)',
    ink: 'oklch(0.88 0.06 85)',
  },
  {
    id: 'nord',
    name: 'Nord',
    scheme: 'dark',
    swatch: 'oklch(0.22 0.025 250)',
    ink: 'oklch(0.90 0.02 230)',
  },
] as const

export const TYPE_PAIRINGS = [
  {
    id: 'book',
    name: 'Book',
    sample: 'Literata',
    previewFamily: '"Literata Variable", Georgia, serif',
  },
  {
    id: 'classic',
    name: 'Classic',
    sample: 'Source Serif',
    previewFamily: '"Source Serif 4 Variable", Georgia, serif',
  },
  {
    id: 'news',
    name: 'News',
    sample: 'Newsreader',
    previewFamily: '"Newsreader Variable", Georgia, serif',
  },
  {
    id: 'quiet',
    name: 'Quiet',
    sample: 'Source Sans',
    previewFamily: '"Source Sans 3 Variable", system-ui, sans-serif',
  },
  {
    id: 'clear',
    name: 'Clear',
    sample: 'Atkinson',
    previewFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
  },
] as const

export const DEFAULT_PALETTE = 'ink'
export const DEFAULT_TYPE = 'book'

export type PaletteId = (typeof PALETTES)[number]['id']
export type TypePairingId = (typeof TYPE_PAIRINGS)[number]['id']

/** id → light/dark, used by the head FOUC script via define:vars */
export const PALETTE_SCHEMES: Record<string, 'light' | 'dark'> =
  Object.fromEntries(PALETTES.map((palette) => [palette.id, palette.scheme]))

export const TYPE_PAIRING_IDS: string[] = TYPE_PAIRINGS.map(
  (pairing) => pairing.id,
)

/** Dropped font-cycle / atmosphere / sun-moon keys. Cleared on boot. */
export const LEGACY_APPEARANCE_KEYS = [
  'font',
  'theme',
  'sumi:atmosphere',
] as const

export function isPalette(value: string): value is PaletteId {
  return PALETTES.some((palette) => palette.id === value)
}

export function isTypePairing(value: string): value is TypePairingId {
  return TYPE_PAIRINGS.some((pairing) => pairing.id === value)
}

export function paletteById(id: string) {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0]
}

export function applyPalette(id: string) {
  if (typeof document === 'undefined') return
  const palette = paletteById(id)
  document.documentElement.setAttribute('data-palette', palette.id)
  document.documentElement.setAttribute('data-theme', palette.scheme)
  document.documentElement.style.colorScheme = palette.scheme
  localStorage.setItem(READING_KEYS.palette, palette.id)
}

export function applyTypePairing(id: string) {
  if (typeof document === 'undefined') return
  const type = isTypePairing(id) ? id : DEFAULT_TYPE
  document.documentElement.setAttribute('data-type', type)
  localStorage.setItem(READING_KEYS.type, type)
}

export function forgetLegacyAppearance() {
  if (typeof localStorage === 'undefined') return
  for (const key of LEGACY_APPEARANCE_KEYS) {
    localStorage.removeItem(key)
  }
}

export function restoreAppearance() {
  if (typeof document === 'undefined') return
  forgetLegacyAppearance()
  applyPalette(
    storedOrDefault(READING_KEYS.palette, isPalette, DEFAULT_PALETTE),
  )
  applyTypePairing(
    storedOrDefault(READING_KEYS.type, isTypePairing, DEFAULT_TYPE),
  )
}

/** First OKLCH channel (lightness). Used for contrast sanity checks. */
export function oklchLightness(value: string): number {
  const match = value.match(/oklch\(\s*([0-9.]+)/i)
  return match ? Number(match[1]) : Number.NaN
}
