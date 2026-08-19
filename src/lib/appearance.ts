/**
 * Site-wide look: one named preset owns color, type, shape, and reading measure.
 * html[data-preset] restyles tokens. html[data-theme] follows the preset scheme
 * so Tailwind `dark:` and Giscus stay in sync.
 */
import {
  READING_KEYS,
  applyReadingLeading,
  applyReadingMeasure,
  applyReadingSize,
  type ReadingLeading,
  type ReadingMeasure,
  type ReadingSize,
} from '@/lib/reading'

export const PRESET_GROUPS = ['comfort', 'world'] as const

export type PresetGroup = (typeof PRESET_GROUPS)[number]
export type RadiusScale = 'sharp' | 'soft' | 'round'

export const PRESETS = [
  {
    id: 'daylight',
    name: 'Daylight',
    group: 'comfort',
    blurb: 'Warm paper, Literata, easy on the eyes in daylight.',
    scheme: 'light' as const,
    swatch: 'oklch(0.985 0.012 90)',
    ink: 'oklch(0.22 0.03 60)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Literata',
      body: 'Literata',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'loose' as ReadingLeading,
    },
    radius: 'soft' as RadiusScale,
  },
  {
    id: 'dusk',
    name: 'Dusk',
    group: 'comfort',
    blurb: 'Warm night, low blue light, slightly larger Literata.',
    scheme: 'dark' as const,
    swatch: 'oklch(0.18 0.02 60)',
    ink: 'oklch(0.92 0.02 80)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Literata',
      body: 'Literata',
    },
    reading: {
      size: 'lg' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'loose' as ReadingLeading,
    },
    radius: 'soft' as RadiusScale,
  },
  {
    id: 'clear',
    name: 'Clear',
    group: 'comfort',
    blurb: 'Atkinson on white. High contrast, larger type, low vision.',
    scheme: 'light' as const,
    swatch: 'oklch(1 0 0)',
    ink: 'oklch(0.12 0 0)',
    fonts: {
      ui: 'Atkinson Hyperlegible',
      display: 'Atkinson Hyperlegible',
      body: 'Atkinson Hyperlegible',
    },
    reading: {
      size: 'xl' as ReadingSize,
      measure: 'wide' as ReadingMeasure,
      leading: 'loose' as ReadingLeading,
    },
    radius: 'sharp' as RadiusScale,
  },
  {
    id: 'beacon',
    name: 'Beacon',
    group: 'comfort',
    blurb: 'Atkinson on black. Night-friendly high contrast.',
    scheme: 'dark' as const,
    swatch: 'oklch(0.1 0 0)',
    ink: 'oklch(0.97 0 0)',
    fonts: {
      ui: 'Atkinson Hyperlegible',
      display: 'Atkinson Hyperlegible',
      body: 'Atkinson Hyperlegible',
    },
    reading: {
      size: 'xl' as ReadingSize,
      measure: 'wide' as ReadingMeasure,
      leading: 'loose' as ReadingLeading,
    },
    radius: 'sharp' as RadiusScale,
  },
  {
    id: 'manuscript',
    name: 'Manuscript',
    group: 'world',
    blurb: 'Literary cream paper. Source Sans with Literata.',
    scheme: 'light' as const,
    swatch: 'oklch(0.97 0.018 85)',
    ink: 'oklch(0.24 0.03 60)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Literata',
      body: 'Literata',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'default' as ReadingLeading,
    },
    radius: 'soft' as RadiusScale,
  },
  {
    id: 'myth',
    name: 'Myth',
    group: 'world',
    blurb: 'Parchment and Fraunces for high fantasy.',
    scheme: 'light' as const,
    swatch: 'oklch(0.94 0.04 80)',
    ink: 'oklch(0.26 0.05 50)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Fraunces',
      body: 'Literata',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'default' as ReadingLeading,
    },
    radius: 'round' as RadiusScale,
  },
  {
    id: 'starfarer',
    name: 'Starfarer',
    group: 'world',
    blurb: 'Cool night sans titles, Source Serif prose. Science fiction.',
    scheme: 'dark' as const,
    swatch: 'oklch(0.17 0.03 250)',
    ink: 'oklch(0.93 0.02 230)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Source Sans 3',
      body: 'Source Serif 4',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'default' as ReadingLeading,
    },
    radius: 'sharp' as RadiusScale,
  },
  {
    id: 'nocturne',
    name: 'Nocturne',
    group: 'world',
    blurb: 'Gothic dark, Fraunces titles, Newsreader body. Horror.',
    scheme: 'dark' as const,
    swatch: 'oklch(0.13 0.02 40)',
    ink: 'oklch(0.9 0.03 75)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Fraunces',
      body: 'Newsreader',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'narrow' as ReadingMeasure,
      leading: 'default' as ReadingLeading,
    },
    radius: 'sharp' as RadiusScale,
  },
  {
    id: 'lantern',
    name: 'Lantern',
    group: 'world',
    blurb: 'Soft color and round corners for YA, fairy tale, anime.',
    scheme: 'light' as const,
    swatch: 'oklch(0.975 0.035 45)',
    ink: 'oklch(0.28 0.07 20)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Fraunces',
      body: 'Literata',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'default' as ReadingMeasure,
      leading: 'default' as ReadingLeading,
    },
    radius: 'round' as RadiusScale,
  },
  {
    id: 'broadsheet',
    name: 'Broadsheet',
    group: 'world',
    blurb: 'Newsreader columns, sharp edges. Pulp, comics, serials.',
    scheme: 'light' as const,
    swatch: 'oklch(0.96 0.02 95)',
    ink: 'oklch(0.16 0.02 60)',
    fonts: {
      ui: 'Source Sans 3',
      display: 'Newsreader',
      body: 'Newsreader',
    },
    reading: {
      size: 'md' as ReadingSize,
      measure: 'narrow' as ReadingMeasure,
      leading: 'snug' as ReadingLeading,
    },
    radius: 'sharp' as RadiusScale,
  },
] as const

export const DEFAULT_PRESET = 'manuscript'

export type PresetId = (typeof PRESETS)[number]['id']

export const PRESET_IDS: string[] = PRESETS.map((preset) => preset.id)

export const PRESET_SCHEMES: Record<string, 'light' | 'dark'> =
  Object.fromEntries(PRESETS.map((preset) => [preset.id, preset.scheme]))

export const PRESET_READING: Record<
  string,
  { size: ReadingSize; measure: ReadingMeasure; leading: ReadingLeading }
> = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset.reading]))

/** Old split palette/type keys → a single preset. */
export const LEGACY_PALETTE_TO_PRESET: Record<string, PresetId> = {
  ink: 'manuscript',
  paper: 'daylight',
  silk: 'lantern',
  garden: 'myth',
  caramel: 'manuscript',
  night: 'dusk',
  coffee: 'nocturne',
  forest: 'myth',
  luxury: 'nocturne',
  nord: 'starfarer',
}

export const LEGACY_APPEARANCE_KEYS = [
  'font',
  'theme',
  'sumi:atmosphere',
  'sumi:palette',
  'sumi:type',
] as const

export function isPreset(value: string): value is PresetId {
  return PRESETS.some((preset) => preset.id === value)
}

export function presetById(id: string) {
  const found = PRESETS.find((preset) => preset.id === id)
  if (found) return found
  return PRESETS.find(
    (preset) => preset.id === DEFAULT_PRESET,
  ) as (typeof PRESETS)[number]
}

export function presetsInGroup(group: PresetGroup) {
  return PRESETS.filter((preset) => preset.group === group)
}

export function applyPreset(id: string) {
  if (typeof document === 'undefined') return
  const preset = isPreset(id) ? presetById(id) : presetById(DEFAULT_PRESET)
  const root = document.documentElement
  root.setAttribute('data-preset', preset.id)
  root.setAttribute('data-theme', preset.scheme)
  root.style.colorScheme = preset.scheme
  localStorage.setItem(READING_KEYS.preset, preset.id)
  applyReadingSize(preset.reading.size)
  applyReadingMeasure(preset.reading.measure)
  applyReadingLeading(preset.reading.leading)
}

export function storedPresetId(): PresetId {
  if (typeof localStorage === 'undefined') return DEFAULT_PRESET
  const stored = localStorage.getItem(READING_KEYS.preset)
  if (stored && isPreset(stored)) return stored
  const type = localStorage.getItem('sumi:type')
  if (type === 'clear') return 'clear'
  const palette = localStorage.getItem('sumi:palette')
  if (palette && palette in LEGACY_PALETTE_TO_PRESET) {
    return LEGACY_PALETTE_TO_PRESET[palette] ?? DEFAULT_PRESET
  }
  return DEFAULT_PRESET
}

export function forgetLegacyAppearance() {
  if (typeof localStorage === 'undefined') return
  for (const key of LEGACY_APPEARANCE_KEYS) {
    localStorage.removeItem(key)
  }
}

export function restoreAppearance() {
  if (typeof document === 'undefined') return
  const id = storedPresetId()
  forgetLegacyAppearance()
  applyPreset(id)
}

/** First OKLCH channel (lightness). Used for contrast sanity checks. */
export function oklchLightness(value: string): number {
  const match = value.match(/oklch\(\s*([0-9.]+)/i)
  return match ? Number(match[1]) : Number.NaN
}
