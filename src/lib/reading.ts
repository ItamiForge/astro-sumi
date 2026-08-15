export const READING_KEYS = {
  size: 'sumi:reading-size',
  measure: 'sumi:reading-measure',
  leading: 'sumi:reading-leading',
  atmosphere: 'sumi:atmosphere',
  continue: 'sumi:continue',
  atlasReveal: 'sumi:atlas-reveal',
  reader: 'sumi:reader',
  immersive: 'sumi:immersive',
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
export const READER_MODES = ['first-time', 'scholar'] as const

export type ReadingSize = (typeof READING_SIZES)[number]
export type ReadingMeasure = (typeof READING_MEASURES)[number]
export type ReadingLeading = (typeof READING_LEADINGS)[number]
export type Atmosphere = (typeof ATMOSPHERES)[number]
export type ReaderMode = (typeof READER_MODES)[number]

export type ContinueState = {
  novelId: string
  novelTitle: string
  chapterTitle: string
  href: string
  scrollY?: number
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

export function isReaderMode(value: string): value is ReaderMode {
  return (READER_MODES as readonly string[]).includes(value)
}

export function applyReaderMode(mode: ReaderMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-reader', mode)
  localStorage.setItem(READING_KEYS.reader, mode)
  localStorage.setItem(READING_KEYS.atlasReveal, mode === 'scholar' ? 'true' : 'false')
}

export function applyImmersive(on: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.toggleAttribute('data-immersive', on)
  localStorage.setItem(READING_KEYS.immersive, on ? 'true' : 'false')
}
