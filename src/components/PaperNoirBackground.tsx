import Grainient from '@/components/Grainient'

/** Exact Grainient look the site should use on the home wash. */
export const PAPER_NOIR = {
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
} as const

export const PAPER_NOIR_LIGHT = PAPER_NOIR
export const PAPER_NOIR_DARK = PAPER_NOIR

export default function PaperNoirBackground() {
  return <Grainient {...PAPER_NOIR} />
}
