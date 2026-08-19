import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { hexToRgb } from '@/components/Grainient'
import {
  PAPER_NOIR,
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
  test('uses the chosen Grainient look on home', () => {
    expect(PAPER_NOIR_LIGHT).toEqual(PAPER_NOIR)
    expect(PAPER_NOIR_DARK).toEqual(PAPER_NOIR)
    expect(PAPER_NOIR).toMatchObject({
      color1: '#e7b28c',
      color2: '#4d4238',
      color3: '#867368',
      timeSpeed: 1.1,
      colorBalance: 0.29,
      warpStrength: 1.5,
      warpFrequency: 2.3,
      warpSpeed: 2.7,
      warpAmplitude: 56,
      blendAngle: 12,
      blendSoftness: 0.44,
      rotationAmount: 1160,
      noiseScale: 1.7,
      grainAmount: 0.14,
      grainScale: 3.5,
      grainAnimated: false,
      contrast: 1.3,
      gamma: 1.05,
      saturation: 1.4,
      centerX: 0.13,
      centerY: 0.28,
      zoom: 0.9,
    })
    expect(PAPER_NOIR.color1).toMatch(hex)
    expect(PAPER_NOIR.color2).toMatch(hex)
    expect(PAPER_NOIR.color3).toMatch(hex)
  })
})

describe('shader backdrop wiring', () => {
  test('shader uses the stock Grainient hash grain', () => {
    const source = readFileSync(
      resolve(root, 'src/components/Grainient.tsx'),
      'utf8',
    )
    expect(source).toContain(
      'fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453)',
    )
    expect(source).not.toContain('float paper=noise(')
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
    expect(backdrop).toContain('background: #4d4238')
    expect(backdrop).toContain('z-index: 0')
    expect(backdrop).not.toContain('z-index: -1')
    expect(backdrop).not.toContain('opacity: 0.12')
    expect(backdrop).not.toContain('prefers-reduced-motion')
  })

  test('only the home page mounts the grain backdrop at body level', () => {
    const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8')
    expect(home).toContain('PaperNoirBackdrop')
    expect(home).toContain('slot="backdrop"')
    expect(home).toContain('home-sheet')

    const layout = readFileSync(
      resolve(root, 'src/layouts/Layout.astro'),
      'utf8',
    )
    expect(layout).toContain('slot name="backdrop"')
    expect(layout).toContain('relative z-10')

    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8')
    expect(css).toContain('.home-sheet')

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
