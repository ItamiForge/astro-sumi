import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_PALETTE,
  DEFAULT_TYPE,
  PALETTES,
  PALETTE_SCHEMES,
  TYPE_PAIRING_IDS,
  TYPE_PAIRINGS,
  applyPalette,
  applyTypePairing,
  forgetLegacyAppearance,
  isPalette,
  isTypePairing,
  oklchLightness,
  restoreAppearance,
} from '@/lib/appearance'
import {
  DEFAULT_READER,
  DEFAULT_SIZE,
  applyImmersive,
  applyReaderMode,
  applyReadingLeading,
  applyReadingMeasure,
  applyReadingSize,
  isReaderMode,
  isReadingLeading,
  isReadingMeasure,
  isReadingSize,
  restoreReadingPrefs,
  storedOrDefault,
} from '@/lib/reading'
import { withBase } from '@/lib/utils/url'

const root = process.cwd()

function mockStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    },
  })
  return store
}

function walkSource(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'test' || entry.name === 'node_modules') continue
      files.push(...walkSource(path))
      continue
    }
    if (
      ['.ts', '.tsx', '.astro', '.css', '.js'].includes(extname(entry.name))
    ) {
      files.push(path)
    }
  }
  return files
}

describe('reading tokens', () => {
  test('accepts known tokens and rejects others', () => {
    expect(isReadingSize('lg')).toBe(true)
    expect(isReadingSize('xxl')).toBe(false)
    expect(isReadingMeasure('narrow')).toBe(true)
    expect(isReadingLeading('loose')).toBe(true)
    expect(isPalette('paper')).toBe(true)
    expect(isPalette('neon')).toBe(false)
    expect(isTypePairing('book')).toBe(true)
    expect(isTypePairing('comic')).toBe(false)
    expect(isReaderMode('scholar')).toBe(true)
    expect(isReaderMode('caught-up')).toBe(false)
  })

  test('storedOrDefault keeps valid values and falls back', () => {
    mockStorage({ 'sumi:reading-size': 'xl' })
    expect(
      storedOrDefault('sumi:reading-size', isReadingSize, DEFAULT_SIZE),
    ).toBe('xl')
    mockStorage({ 'sumi:reading-size': 'huge' })
    expect(
      storedOrDefault('sumi:reading-size', isReadingSize, DEFAULT_SIZE),
    ).toBe(DEFAULT_SIZE)
  })
})

describe('appearance presets', () => {
  test('ships unique named palettes and type pairings', () => {
    const paletteIds = PALETTES.map((palette) => palette.id)
    const typeIds = TYPE_PAIRINGS.map((pairing) => pairing.id)
    expect(paletteIds).toHaveLength(10)
    expect(typeIds).toHaveLength(5)
    expect(new Set(paletteIds).size).toBe(paletteIds.length)
    expect(new Set(typeIds).size).toBe(typeIds.length)
    expect(DEFAULT_PALETTE).toBe('ink')
    expect(DEFAULT_TYPE).toBe('book')
    expect(PALETTE_SCHEMES['ink']).toBe('light')
    expect(PALETTE_SCHEMES['night']).toBe('dark')
    expect(TYPE_PAIRING_IDS).toEqual(typeIds)
  })

  test('keeps body ink far from the page swatch', () => {
    for (const palette of PALETTES) {
      const paper = oklchLightness(palette.swatch)
      const ink = oklchLightness(palette.ink)
      expect(paper).not.toBeNaN()
      expect(ink).not.toBeNaN()
      expect(Math.abs(paper - ink)).toBeGreaterThan(0.45)
      if (palette.scheme === 'light') {
        expect(paper).toBeGreaterThan(0.85)
        expect(ink).toBeLessThan(0.4)
      } else {
        expect(paper).toBeLessThan(0.3)
        expect(ink).toBeGreaterThan(0.8)
      }
    }
  })

  test('CSS defines tokens for every palette and type pairing', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8')
    for (const palette of PALETTES) {
      expect(css).toContain(`html[data-palette='${palette.id}']`)
    }
    for (const pairing of TYPE_PAIRINGS) {
      expect(css).toContain(`html[data-type='${pairing.id}']`)
    }
    expect(css).toContain('font-family: var(--font-body)')
    expect(css).toContain('--font-ui:')
    expect(css).toContain('--font-display:')
    expect(css).not.toContain('data-atmosphere')
  })

  test('FOUC boot reads the shared appearance config', () => {
    const head = readFileSync(
      resolve(root, 'src/components/Head.astro'),
      'utf8',
    )
    expect(head).toContain("from '@/lib/appearance'")
    expect(head).toContain('PALETTE_SCHEMES')
    expect(head).toContain('TYPE_PAIRING_IDS')
    expect(head).toContain('LEGACY_APPEARANCE_KEYS')
    expect(head).toContain('define:vars')
  })

  test('settings overlay lives outside the sticky header', () => {
    const layout = readFileSync(
      resolve(root, 'src/layouts/Layout.astro'),
      'utf8',
    )
    expect(layout.indexOf('<ReadingSettings')).toBeGreaterThan(
      layout.indexOf('</header>'),
    )
    const crumbs = readFileSync(
      resolve(root, 'src/components/Breadcrumbs.astro'),
      'utf8',
    )
    expect(crumbs).toContain('withBase(item.href)')
  })

  test('applyPalette writes data-palette and matching data-theme', () => {
    const store = mockStorage()
    applyPalette('night')
    expect(document.documentElement.getAttribute('data-palette')).toBe('night')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(store.get('sumi:palette')).toBe('night')

    applyPalette('unknown')
    expect(document.documentElement.getAttribute('data-palette')).toBe('ink')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  test('applyTypePairing writes data-type', () => {
    mockStorage()
    applyTypePairing('clear')
    expect(document.documentElement.getAttribute('data-type')).toBe('clear')
    applyTypePairing('comic-sans')
    expect(document.documentElement.getAttribute('data-type')).toBe('book')
  })

  test('restoreAppearance applies stored prefs and drops leftover keys', () => {
    const store = mockStorage({
      'sumi:palette': 'coffee',
      'sumi:type': 'news',
      font: 'geist',
      theme: 'dark',
      'sumi:atmosphere': 'parchment',
    })
    restoreAppearance()
    expect(document.documentElement.getAttribute('data-palette')).toBe('coffee')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-type')).toBe('news')
    expect(store.has('font')).toBe(false)
    expect(store.has('theme')).toBe(false)
    expect(store.has('sumi:atmosphere')).toBe(false)
  })

  test('forgetLegacyAppearance is a no-op when those keys are absent', () => {
    const store = mockStorage({ 'sumi:palette': 'ink' })
    forgetLegacyAppearance()
    expect(store.get('sumi:palette')).toBe('ink')
  })
})

describe('reading prefs', () => {
  test('size, measure, leading, reader, and immersive write html + storage', () => {
    const store = mockStorage()
    applyReadingSize('lg')
    applyReadingMeasure('wide')
    applyReadingLeading('snug')
    applyReaderMode('scholar')
    applyImmersive(true)

    expect(document.documentElement.getAttribute('data-reading-size')).toBe(
      'lg',
    )
    expect(document.documentElement.getAttribute('data-reading-measure')).toBe(
      'wide',
    )
    expect(document.documentElement.getAttribute('data-reading-leading')).toBe(
      'snug',
    )
    expect(document.documentElement.getAttribute('data-reader')).toBe('scholar')
    expect(document.documentElement.hasAttribute('data-immersive')).toBe(true)
    expect(store.get('sumi:reading-size')).toBe('lg')
    expect(store.get('sumi:atlas-reveal')).toBe('true')

    applyReadingSize('nope')
    applyReaderMode('nope')
    expect(document.documentElement.getAttribute('data-reading-size')).toBe(
      DEFAULT_SIZE,
    )
    expect(document.documentElement.getAttribute('data-reader')).toBe(
      DEFAULT_READER,
    )
  })

  test('restoreReadingPrefs hydrates from storage', () => {
    mockStorage({
      'sumi:reading-size': 'sm',
      'sumi:reading-measure': 'narrow',
      'sumi:reading-leading': 'loose',
      'sumi:reader': 'first-time',
      'sumi:immersive': 'true',
    })
    restoreReadingPrefs()
    expect(document.documentElement.getAttribute('data-reading-size')).toBe(
      'sm',
    )
    expect(document.documentElement.getAttribute('data-reading-measure')).toBe(
      'narrow',
    )
    expect(document.documentElement.getAttribute('data-reading-leading')).toBe(
      'loose',
    )
    expect(document.documentElement.getAttribute('data-reader')).toBe(
      'first-time',
    )
    expect(document.documentElement.hasAttribute('data-immersive')).toBe(true)
  })
})

describe('leftover appearance files', () => {
  test('old font-cycle components and font files are gone', () => {
    expect(existsSync(resolve(root, 'src/components/FontToggle.astro'))).toBe(
      false,
    )
    expect(existsSync(resolve(root, 'src/components/ThemeToggle.astro'))).toBe(
      false,
    )
    expect(existsSync(resolve(root, 'public/fonts/geist/geist.woff2'))).toBe(
      false,
    )
    expect(existsSync(resolve(root, 'public/fonts/noto-sans'))).toBe(false)
    expect(existsSync(resolve(root, 'public/fonts/messy-handwritten'))).toBe(
      false,
    )
    expect(
      existsSync(resolve(root, 'public/fonts/geist/geist-mono.woff2')),
    ).toBe(true)
  })

  test('source does not reference removed appearance APIs', () => {
    const banned =
      /FontToggle|ThemeToggle|data-atmosphere|messy-handwritten|data-font=/
    for (const file of walkSource(resolve(root, 'src'))) {
      const text = readFileSync(file, 'utf8')
      expect(text, file).not.toMatch(banned)
    }
  })
})

describe('breadcrumb URLs', () => {
  test('withBase prefixes internal crumb paths', () => {
    expect(withBase('/codex')).toMatch(/\/codex$/)
    expect(withBase('/')).toBe(import.meta.env.BASE_URL)
    expect(withBase('https://example.com/x')).toBe('https://example.com/x')
    expect(withBase('mailto:hi@example.com')).toBe('mailto:hi@example.com')
    expect(withBase('#notes')).toBe('#notes')
  })
})
