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

describe('paper noir palette', () => {
  test('keeps raw paper/ink hex and grain in range', () => {
    for (const palette of [PAPER_NOIR_LIGHT, PAPER_NOIR_DARK]) {
      expect(palette.color1).toMatch(hex)
      expect(palette.color2).toMatch(hex)
      expect(palette.color3).toMatch(hex)
      expect(palette.grainAmount).toBeGreaterThan(0.2)
      expect(palette.saturation).toBeLessThan(0.5)
      expect(palette.timeSpeed).toBeLessThan(0.3)
    }

    const light = hexToRgb(PAPER_NOIR_LIGHT.color1)
    const dark = hexToRgb(PAPER_NOIR_DARK.color3)
    const lightLuma = light[0]! * 0.2 + light[1]! * 0.7 + light[2]! * 0.1
    const darkLuma = dark[0]! * 0.2 + dark[1]! * 0.7 + dark[2]! * 0.1
    expect(lightLuma).toBeGreaterThan(0.7)
    expect(darkLuma).toBeLessThan(0.1)
  })
})

describe('shader backdrop wiring', () => {
  test('authors and about pages mount the grain backdrop', () => {
    const pages = [
      'src/pages/about.astro',
      'src/pages/authors/index.astro',
      'src/pages/authors/[...id].astro',
    ]
    for (const page of pages) {
      const source = readFileSync(resolve(root, page), 'utf8')
      expect(source, page).toContain('PaperNoirBackdrop')
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
