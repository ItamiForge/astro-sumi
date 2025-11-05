/**
 * Image optimization utilities for accessibility and performance
 */

/**
 * Validates alt text for accessibility compliance
 * @param altText - The alt text to validate
 * @param imageName - The image name for error reporting
 * @returns boolean indicating if alt text is valid
 */
export function validateAltText(altText: string, imageName?: string): boolean {
  const issues: string[] = []
  
  // Check if alt text is empty
  if (!altText || altText.trim().length === 0) {
    issues.push('Alt text is empty')
  }
  
  // Check if alt text is too short (less than 3 characters)
  if (altText.trim().length < 3) {
    issues.push('Alt text is too short (less than 3 characters)')
  }
  
  // Check if alt text is too long (more than 125 characters)
  if (altText.length > 125) {
    issues.push('Alt text is too long (more than 125 characters)')
  }
  
  // Check for redundant phrases
  const redundantPhrases = [
    'image of',
    'picture of',
    'photo of',
    'graphic of',
    'illustration of'
  ]
  
  const lowerAltText = altText.toLowerCase()
  redundantPhrases.forEach(phrase => {
    if (lowerAltText.includes(phrase)) {
      issues.push(`Alt text contains redundant phrase: "${phrase}"`)
    }
  })
  
  // Log issues in development
  if (issues.length > 0 && import.meta.env.DEV) {
    console.warn(`Alt text validation issues for ${imageName || 'image'}:`, issues)
  }
  
  return issues.length === 0
}

/**
 * Generates responsive image sizes based on breakpoints
 * @param baseWidth - Base width of the image
 * @returns Array of widths for responsive images
 */
export function generateResponsiveWidths(baseWidth: number): number[] {
  const multipliers = [0.5, 1, 1.5, 2]
  return multipliers.map(mult => Math.round(baseWidth * mult))
}

/**
 * Generates sizes attribute for responsive images
 * @param breakpoints - Object with breakpoint sizes
 * @returns Sizes string for responsive images
 */
export function generateSizesAttribute(breakpoints: {
  mobile?: string
  tablet?: string
  desktop?: string
  default: string
}): string {
  const sizes: string[] = []
  
  if (breakpoints.mobile) {
    sizes.push(`(max-width: 640px) ${breakpoints.mobile}`)
  }
  
  if (breakpoints.tablet) {
    sizes.push(`(max-width: 1024px) ${breakpoints.tablet}`)
  }
  
  if (breakpoints.desktop) {
    sizes.push(`(max-width: 1280px) ${breakpoints.desktop}`)
  }
  
  sizes.push(breakpoints.default)
  
  return sizes.join(', ')
}

/**
 * Common responsive image configurations
 */
export const RESPONSIVE_CONFIGS = {
  novelCover: {
    widths: [150, 300, 450] as number[],
    sizes: generateSizesAttribute({
      mobile: '50vw',
      tablet: '33vw',
      default: '300px'
    })
  },
  heroImage: {
    widths: [400, 800, 1200, 1600] as number[],
    sizes: generateSizesAttribute({
      mobile: '100vw',
      tablet: '80vw',
      default: '1200px'
    })
  },
  logo: {
    widths: [24, 48, 72] as number[],
    sizes: '24px'
  }
}