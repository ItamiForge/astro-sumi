import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { hexToRgb } from '@/components/Grainient'
import {
  PAPER_NOIR_DARK,
  PAPER_NOIR_LIGHT,
} from '@/components/PaperNoirBackground'

const root = process.cwd()
const hex = /^#[0-9A-F]{6}$/i

describe('grainient color parsing', () => {
  test('converts 6-digit hex into 0–1 rgb', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1])
    expect(hexToRgb('#E6D5B8')).toEqual([230 / 255, 213 / 255, 184 / 255])
  })

  test('falls back to white for invalid hex', () => {
    expect(hexToRgb('not-a-color')).toEqual([1, 1, 1])
    expect(hexToRgb('#fff')).toEqual([1, 1, 1])
  })
})

describe('paper grain palette', () => {
  test('keeps a visible paper-noir range with quiet motion', () => {
    for (const palette of [PAPER_NOIR_LIGHT, PAPER_NOIR_DARK]) {
      expect(palette.color1).toMatch(hex)
      expect(palette.color2).toMatch(hex)
      expect(palette.color3).toMatch(hex)
      expect(palette.grainAmount).toBeGreaterThan(0.05)
      expect(palette.grainAmount).toBeLessThan(0.16)
      expect(palette.grainAnimated).toBe(false)
      expect(palette.timeSpeed).toBeGreaterThan(0)
      expect(palette.timeSpeed).toBeLessThan(0.08)
      expect(palette.warpSpeed).toBeGreaterThan(0)
      expect(palette.warpSpeed).toBeLessThan(0.25)
    }

    const lightHi = hexToRgb(PAPER_NOIR_LIGHT.color1)
    const lightLo = hexToRgb(PAPER_NOIR_LIGHT.color3)
    const lightHiLuma =
      lightHi[0]! * 0.2 + lightHi[1]! * 0.7 + lightHi[2]! * 0.1
    const lightLoLuma =
      lightLo[0]! * 0.2 + lightLo[1]! * 0.7 + lightLo[2]! * 0.1
    expect(lightHiLuma - lightLoLuma).toBeGreaterThan(0.35)

    const dark = hexToRgb(PAPER_NOIR_DARK.color3)
    const darkLuma = dark[0]! * 0.2 + dark[1]! * 0.7 + dark[2]! * 0.1
    expect(darkLuma).toBeLessThan(0.15)
  })
})

describe('shader backdrop wiring', () => {
  test('shader uses soft paper noise instead of hash static', () => {
    const source = readFileSync(
      resolve(root, 'src/components/Grainient.tsx'),
      'utf8',
    )
    expect(source).toContain('float paper=noise(')
    expect(source).not.toContain('fract(sin(dot(grainUv,vec2(12.9898,78.233)))')
  })

  test('footer sits on an opaque bar above the grain', () => {
    const footer = readFileSync(
      resolve(root, 'src/components/Footer.astro'),
      'utf8',
    )
    expect(footer).toContain('bg-background')
    expect(footer).toContain('text-foreground')
    expect(footer).toContain('relative z-10')
    expect(footer).not.toContain('text-muted-foreground')
  })

  test('backdrop is a full wash, not a faded cream overlay', () => {
    const backdrop = readFileSync(
      resolve(root, 'src/components/PaperNoirBackdrop.astro'),
      'utf8',
    )
    expect(backdrop).toContain('background: #c4a882')
    expect(backdrop).toContain('z-index: 0')
    expect(backdrop).not.toContain('z-index: -1')
    expect(backdrop).not.toContain('opacity: 0.12')
    expect(backdrop).not.toContain('prefers-reduced-motion')
  })

  test('only the home page mounts the grain backdrop at body level', () => {
    const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8')
    expect(home).toContain('PaperNoirBackdrop')
    expect(home).toContain('slot="backdrop"')

    const layout = readFileSync(
      resolve(root, 'src/layouts/Layout.astro'),
      'utf8',
    )
    expect(layout).toContain('slot name="backdrop"')
    expect(layout).toContain('relative z-10')

    const elsewhere = [
      'src/pages/about.astro',
      'src/pages/authors/index.astro',
      'src/pages/authors/[...id].astro',
      'src/pages/novels/[...page].astro',
      'src/pages/codex/index.astro',
    ]
    for (const page of elsewhere) {
      const source = readFileSync(resolve(root, page), 'utf8')
      expect(source, page).not.toContain('PaperNoirBackdrop')
      expect(source, page).not.toContain('background.webp')
    }
  })

  test('old about-page photo is gone', () => {
    expect(existsSync(resolve(root, 'public/static/background.webp'))).toBe(
      false,
    )
  })

  test('service worker precache paths that look like files exist', () => {
    const sw = readFileSync(resolve(root, 'public/sw.js'), 'utf8')
    expect(sw).not.toContain('background.webp')
    const assets = [...sw.matchAll(/'(?:\/)([^']+\.[a-z0-9]+)'/gi)].map(
      (match) => match[1]!,
    )
    expect(assets.length).toBeGreaterThan(0)
    for (const asset of assets) {
      expect(existsSync(resolve(root, 'public', asset)), asset).toBe(true)
    }
  })
})
