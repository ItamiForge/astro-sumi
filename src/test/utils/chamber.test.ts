import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_PRESET,
  LEGACY_PALETTE_TO_PRESET,
  PRESET_IDS,
  PRESET_READING,
  PRESET_SCHEMES,
  PRESETS,
  applyPreset,
  forgetLegacyAppearance,
  isPreset,
  oklchLightness,
  restoreAppearance,
  storedPresetId,
} from '@/lib/appearance'
import {
  DEFAULT_READER,
  applyImmersive,
  applyReaderMode,
  isReaderMode,
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
    expect(isPreset('manuscript')).toBe(true)
    expect(isPreset('neon')).toBe(false)
    expect(isReaderMode('scholar')).toBe(true)
    expect(isReaderMode('caught-up')).toBe(false)
  })

  test('storedOrDefault keeps valid values and falls back', () => {
    mockStorage({ 'sumi:reader': 'scholar' })
    expect(storedOrDefault('sumi:reader', isReaderMode, DEFAULT_READER)).toBe(
      'scholar',
    )
    mockStorage({ 'sumi:reader': 'caught-up' })
    expect(storedOrDefault('sumi:reader', isReaderMode, DEFAULT_READER)).toBe(
      DEFAULT_READER,
    )
  })
})

describe('look presets', () => {
  test('ships unique named presets with fonts and reading measure', () => {
    const ids = PRESETS.map((preset) => preset.id)
    expect(ids).toHaveLength(10)
    expect(new Set(ids).size).toBe(ids.length)
    expect(DEFAULT_PRESET).toBe('manuscript')
    expect(PRESET_SCHEMES['manuscript']).toBe('light')
    expect(PRESET_SCHEMES['dusk']).toBe('dark')
    expect(PRESET_SCHEMES['beacon']).toBe('dark')
    expect(PRESET_IDS).toEqual(ids)
    const manuscript = PRESETS.find((preset) => preset.id === 'manuscript')
    expect(manuscript?.fonts).toEqual({
      ui: 'Bricolage Grotesque',
      display: 'Fraunces',
      body: 'Literata',
    })
    for (const preset of PRESETS) {
      expect(preset.fonts.ui.length).toBeGreaterThan(0)
      expect(preset.fonts.display.length).toBeGreaterThan(0)
      expect(preset.fonts.body.length).toBeGreaterThan(0)
      expect(PRESET_READING[preset.id]).toEqual(preset.reading)
    }
  })

  test('keeps body ink far from the page swatch', () => {
    for (const preset of PRESETS) {
      const paper = oklchLightness(preset.swatch)
      const ink = oklchLightness(preset.ink)
      expect(paper).not.toBeNaN()
      expect(ink).not.toBeNaN()
      expect(Math.abs(paper - ink)).toBeGreaterThan(0.45)
      if (preset.scheme === 'light') {
        expect(paper).toBeGreaterThan(0.85)
        expect(ink).toBeLessThan(0.4)
      } else {
        expect(paper).toBeLessThan(0.3)
        expect(ink).toBeGreaterThan(0.8)
      }
    }
  })

  test('settings panel is presets plus spoilers only', () => {
    const settings = readFileSync(
      resolve(root, 'src/components/ReadingSettings.astro'),
      'utf8',
    )
    expect(settings).toContain('data-reading-group="preset"')
    expect(settings).toContain('data-reading-group="reader"')
    expect(settings).not.toContain('data-reading-group="size"')
    expect(settings).not.toContain('data-reading-group="palette"')
    expect(settings).not.toContain('data-reading-group="type"')
  })

  test('CSS defines tokens for every preset', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8')
    for (const preset of PRESETS) {
      expect(css).toContain(`html[data-preset='${preset.id}']`)
    }
    expect(css).toContain("html[data-preset='beacon']")
    expect(css).toContain("'Fraunces Variable'")
    expect(css).toContain("'Bricolage Grotesque Variable'")
    expect(css).toContain('font-family: var(--font-body)')
    expect(css).toContain('font-family: var(--font-display)')
    expect(css).toContain('--font-ui:')
    expect(css).toContain("html[data-reading-size='xl']")
    expect(css).not.toContain("html[data-palette='ink']")
    expect(css).not.toContain("html[data-type='book']")
    expect(css).not.toContain('data-atmosphere')
  })

  test('FOUC boot reads the shared preset config', () => {
    const head = readFileSync(
      resolve(root, 'src/components/Head.astro'),
      'utf8',
    )
    expect(head).toContain("from '@/lib/appearance'")
    expect(head).toContain('PRESET_SCHEMES')
    expect(head).toContain('PRESET_IDS')
    expect(head).toContain('PRESET_READING')
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

  test('applyPreset writes data-preset, theme, and reading measure', () => {
    const store = mockStorage()
    applyPreset('dusk')
    expect(document.documentElement.getAttribute('data-preset')).toBe('dusk')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-reading-size')).toBe(
      'lg',
    )
    expect(store.get('sumi:preset')).toBe('dusk')

    applyPreset('unknown')
    expect(document.documentElement.getAttribute('data-preset')).toBe(
      'manuscript',
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  test('restoreAppearance migrates old palette keys and drops leftovers', () => {
    const store = mockStorage({
      'sumi:palette': 'nord',
      'sumi:type': 'news',
      font: 'geist',
      theme: 'dark',
      'sumi:atmosphere': 'parchment',
    })
    restoreAppearance()
    expect(storedPresetId()).toBe('starfarer')
    expect(document.documentElement.getAttribute('data-preset')).toBe(
      'starfarer',
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(store.has('font')).toBe(false)
    expect(store.has('theme')).toBe(false)
    expect(store.has('sumi:atmosphere')).toBe(false)
    expect(store.has('sumi:palette')).toBe(false)
  })

  test('clear type pairing migrates to the Clear preset', () => {
    mockStorage({ 'sumi:type': 'clear', 'sumi:palette': 'ink' })
    restoreAppearance()
    expect(document.documentElement.getAttribute('data-preset')).toBe('clear')
  })

  test('legacy palette map covers the retired palette ids', () => {
    expect(Object.keys(LEGACY_PALETTE_TO_PRESET).length).toBe(10)
  })

  test('forgetLegacyAppearance is a no-op when those keys are absent', () => {
    const store = mockStorage({ 'sumi:preset': 'manuscript' })
    forgetLegacyAppearance()
    expect(store.get('sumi:preset')).toBe('manuscript')
  })
})

describe('reading prefs', () => {
  test('reader and immersive write html + storage', () => {
    const store = mockStorage()
    applyReaderMode('scholar')
    applyImmersive(true)

    expect(document.documentElement.getAttribute('data-reader')).toBe('scholar')
    expect(document.documentElement.hasAttribute('data-immersive')).toBe(true)
    expect(store.get('sumi:atlas-reveal')).toBe('true')

    applyReaderMode('nope')
    expect(document.documentElement.getAttribute('data-reader')).toBe(
      DEFAULT_READER,
    )
  })

  test('restoreReadingPrefs hydrates reader and immersive only', () => {
    mockStorage({
      'sumi:reader': 'first-time',
      'sumi:immersive': 'true',
    })
    restoreReadingPrefs()
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
      /FontToggle|ThemeToggle|data-atmosphere|messy-handwritten|data-font=|html\[data-palette/
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
