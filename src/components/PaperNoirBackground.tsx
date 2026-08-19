import { useEffect, useState } from 'react'
import Grainient from '@/components/Grainient'

/** Still paper wash: value-noise fiber, no flicker, no drift. */
const quiet = {
  timeSpeed: 0,
  warpStrength: 0.08,
  warpFrequency: 1.1,
  warpSpeed: 0,
  warpAmplitude: 180,
  blendAngle: 12,
  blendSoftness: 0.55,
  rotationAmount: 18,
  noiseScale: 0.4,
  grainScale: 1.35,
  grainAmount: 0.028,
  grainAnimated: false,
  contrast: 1,
  gamma: 1,
  saturation: 0.14,
  centerX: 0.02,
  centerY: -0.03,
  zoom: 1.15,
}

export const PAPER_NOIR_LIGHT = {
  ...quiet,
  color1: '#F7F1E6',
  color2: '#EDE4D4',
  color3: '#DFD3C0',
  colorBalance: 0.48,
}

export const PAPER_NOIR_DARK = {
  ...quiet,
  color1: '#2C2822',
  color2: '#221F1B',
  color3: '#1A1814',
  colorBalance: 0.22,
  grainAmount: 0.02,
}

export default function PaperNoirBackground() {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      setScheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const props = scheme === 'dark' ? PAPER_NOIR_DARK : PAPER_NOIR_LIGHT
  return <Grainient {...props} />
}
