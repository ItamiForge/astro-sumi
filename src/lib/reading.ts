export const READING_KEYS = {
  size: 'sumi:reading-size',
  measure: 'sumi:reading-measure',
  leading: 'sumi:reading-leading',
  atmosphere: 'sumi:atmosphere',
  continue: 'sumi:continue',
  atlasReveal: 'sumi:atlas-reveal',
} as const

export const READING_SIZES = ['sm', 'md', 'lg', 'xl'] as const
export const READING_MEASURES = ['narrow', 'default', 'wide'] as const
export const READING_LEADINGS = ['snug', 'default', 'loose'] as const
export const ATMOSPHERES = [
  'default',
  'parchment',
  'bronze',
  'void',
  'starlight',
] as const

export type ReadingSize = (typeof READING_SIZES)[number]
export type ReadingMeasure = (typeof READING_MEASURES)[number]
export type ReadingLeading = (typeof READING_LEADINGS)[number]
export type Atmosphere = (typeof ATMOSPHERES)[number]

export type ContinueState = {
  novelId: string
  novelTitle: string
  chapterTitle: string
  href: string
  updatedAt: number
}

export function isReadingSize(value: string): value is ReadingSize {
  return (READING_SIZES as readonly string[]).includes(value)
}

export function isReadingMeasure(value: string): value is ReadingMeasure {
  return (READING_MEASURES as readonly string[]).includes(value)
}

export function isReadingLeading(value: string): value is ReadingLeading {
  return (READING_LEADINGS as readonly string[]).includes(value)
}

export function isAtmosphere(value: string): value is Atmosphere {
  return (ATMOSPHERES as readonly string[]).includes(value)
}
