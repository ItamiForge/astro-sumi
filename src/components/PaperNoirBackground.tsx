import { useEffect, useState } from 'react'
import Grainient from '@/components/Grainient'

const shared = {
  timeSpeed: 0.1,
  warpStrength: 0.45,
  warpFrequency: 2.8,
  warpSpeed: 0.55,
  warpAmplitude: 80,
  blendAngle: 22,
  blendSoftness: 0.28,
  rotationAmount: 90,
  noiseScale: 1.15,
  grainScale: 1.4,
  grainAnimated: true,
  gamma: 1.02,
  centerX: 0.04,
  centerY: -0.06,
  zoom: 1.05,
}

export const PAPER_NOIR_LIGHT = {
  ...shared,
  color1: '#E6D5B8',
  color2: '#6A4E38',
  color3: '#1C1612',
  colorBalance: 0.32,
  grainAmount: 0.28,
  contrast: 1.22,
  saturation: 0.34,
}

export const PAPER_NOIR_DARK = {
  ...shared,
  color1: '#C4B08C',
  color2: '#3A3228',
  color3: '#070605',
  colorBalance: -0.08,
  grainAmount: 0.34,
  contrast: 1.32,
  saturation: 0.22,
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
