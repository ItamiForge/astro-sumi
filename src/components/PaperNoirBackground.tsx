import { useEffect, useState } from 'react'
import Grainient from '@/components/Grainient'

/**
 * Mellow paper-noir: slow wash, soft fiber grain, no flicker.
 * Color range has to stay (paper → tan → umber) or the layer reads as flat cream.
 */
const quiet = {
  timeSpeed: 0.045,
  warpStrength: 0.32,
  warpFrequency: 1.8,
  warpSpeed: 0.12,
  warpAmplitude: 110,
  blendAngle: 18,
  blendSoftness: 0.4,
  rotationAmount: 48,
  noiseScale: 0.7,
  grainScale: 1.5,
  grainAnimated: false,
  gamma: 1.02,
  centerX: 0.03,
  centerY: -0.04,
  zoom: 1.08,
}

export const PAPER_NOIR_LIGHT = {
  ...quiet,
  color1: '#F4ECDD',
  color2: '#C4A882',
  color3: '#5C4A3A',
  colorBalance: 0.3,
  grainAmount: 0.09,
  contrast: 1.08,
  saturation: 0.28,
}

export const PAPER_NOIR_DARK = {
  ...quiet,
  color1: '#D4C4A8',
  color2: '#4A4036',
  color3: '#14110E',
  colorBalance: 0.08,
  grainAmount: 0.07,
  contrast: 1.1,
  saturation: 0.2,
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
