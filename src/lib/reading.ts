/**
 * Chamber preferences that stay independent of the look preset:
 * spoiler mode, immersive chrome, continue-reading.
 */
export const READING_KEYS = {
  size: 'sumi:reading-size',
  measure: 'sumi:reading-measure',
  leading: 'sumi:reading-leading',
  preset: 'sumi:preset',
  palette: 'sumi:palette',
  type: 'sumi:type',
  continue: 'sumi:continue',
  atlasReveal: 'sumi:atlas-reveal',
  reader: 'sumi:reader',
  immersive: 'sumi:immersive',
} as const

export const READING_SIZES = ['sm', 'md', 'lg', 'xl'] as const
export const READING_MEASURES = ['narrow', 'default', 'wide'] as const
export const READING_LEADINGS = ['snug', 'default', 'loose'] as const
export const READER_MODES = ['first-time', 'scholar'] as const

export type ReadingSize = (typeof READING_SIZES)[number]
export type ReadingMeasure = (typeof READING_MEASURES)[number]
export type ReadingLeading = (typeof READING_LEADINGS)[number]
export type ReaderMode = (typeof READER_MODES)[number]

export const DEFAULT_SIZE: ReadingSize = 'md'
export const DEFAULT_MEASURE: ReadingMeasure = 'default'
export const DEFAULT_LEADING: ReadingLeading = 'default'
export const DEFAULT_READER: ReaderMode = 'first-time'

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

export function isReaderMode(value: string): value is ReaderMode {
  return (READER_MODES as readonly string[]).includes(value)
}

export function storedOrDefault<T extends string>(
  key: string,
  isValid: (value: string) => value is T,
  fallback: T,
): T {
  if (typeof localStorage === 'undefined') return fallback
  const value = localStorage.getItem(key)
  return value && isValid(value) ? value : fallback
}

function writePref(attr: string, key: string, value: string) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(attr, value)
  localStorage.setItem(key, value)
}

export function applyReadingSize(value: string) {
  const size = isReadingSize(value) ? value : DEFAULT_SIZE
  writePref('data-reading-size', READING_KEYS.size, size)
}

export function applyReadingMeasure(value: string) {
  const measure = isReadingMeasure(value) ? value : DEFAULT_MEASURE
  writePref('data-reading-measure', READING_KEYS.measure, measure)
}

export function applyReadingLeading(value: string) {
  const leading = isReadingLeading(value) ? value : DEFAULT_LEADING
  writePref('data-reading-leading', READING_KEYS.leading, leading)
}

export function applyReaderMode(mode: string) {
  const reader = isReaderMode(mode) ? mode : DEFAULT_READER
  writePref('data-reader', READING_KEYS.reader, reader)
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    READING_KEYS.atlasReveal,
    reader === 'scholar' ? 'true' : 'false',
  )
}

export function applyImmersive(on: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.toggleAttribute('data-immersive', on)
  localStorage.setItem(READING_KEYS.immersive, on ? 'true' : 'false')
}

export function restoreReadingPrefs() {
  applyReaderMode(
    storedOrDefault(READING_KEYS.reader, isReaderMode, DEFAULT_READER),
  )
  applyImmersive(localStorage.getItem(READING_KEYS.immersive) === 'true')
}
