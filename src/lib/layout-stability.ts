/**
 * Layout Stability Utilities
 * Helps prevent Cumulative Layout Shift (CLS) issues
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

/**
 * Creates a stable container with aspect ratio to prevent layout shifts
 * @param aspectRatio - The aspect ratio (width/height)
 * @returns CSS properties for stable container
 */
export function createStableContainer(aspectRatio: number) {
  return {
    aspectRatio: aspectRatio.toString(),
    width: '100%',
    height: 'auto',
  }
}

/**
 * Common aspect ratios for different content types
 */
export const ASPECT_RATIOS = {
  // Novel covers (3:4 ratio)
  novelCover: 3 / 4,
  // Social media images (16:9 ratio)
  socialCard: 16 / 9,
  // Square images
  square: 1,
  // Avatar images
  avatar: 1,
  // Logo images (typically wider)
  logo: 2 / 1,
} as const

/**
 * Prevents layout shift by reserving space for dynamic content
 * @param minHeight - Minimum height to reserve
 * @returns CSS properties for layout stability
 */
export function reserveSpace(minHeight: string | number) {
  return {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
  }
}

/**
 * Creates skeleton loading styles to maintain layout during loading
 * @param width - Width of the skeleton
 * @param height - Height of the skeleton
 * @returns CSS properties for skeleton loader
 */
export function createSkeleton(width: string = '100%', height: string = '1rem') {
  return {
    width,
    height,
    backgroundColor: 'hsl(var(--muted))',
    borderRadius: '0.25rem',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  }
}

/**
 * Optimizes images for better LCP and CLS
 * @param src - Image source
 * @param alt - Alt text
 * @param width - Image width
 * @param height - Image height
 * @param priority - Whether this is a priority image (above fold)
 * @returns Optimized image properties
 */
export function optimizeImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}) {
  return {
    src,
    alt,
    width,
    height,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: priority ? ('sync' as const) : ('async' as const),
    style: {
      aspectRatio: `${width} / ${height}`,
      width: '100%',
      height: 'auto',
    },
  }
}

/**
 * Creates a stable grid layout that prevents shifts
 * @param columns - Number of columns
 * @param gap - Gap between items
 * @returns CSS grid properties
 */
export function createStableGrid(columns: number, gap: string = '1rem') {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    width: '100%',
  }
}

/**
 * Prevents flash of unstyled content (FOUC) and layout shifts
 */
export function preventFOUC() {
  // Add critical CSS inline to prevent FOUC
  const criticalCSS = `
    /* Critical styles to prevent FOUC */
    .novel-card-skeleton {
      aspect-ratio: 3 / 4;
      background-color: hsl(var(--muted));
      border-radius: 0.5rem;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .avatar-skeleton {
      aspect-ratio: 1;
      background-color: hsl(var(--muted));
      border-radius: 50%;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `
  
  // Inject critical CSS
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = criticalCSS
    document.head.appendChild(style)
  }
}

/**
 * Measures and reports Core Web Vitals
 */
export function measureCoreWebVitals() {
  if (typeof window === 'undefined') return

  // Only measure in production
  if (import.meta.env.DEV) return

  // Measure LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        if (lastEntry) {
          console.log('LCP:', lastEntry.startTime, 'ms')
          
          // Report to analytics if available
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(lastEntry.startTime),
              event_category: 'Performance',
            })
          }
        }
      })
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('Could not measure LCP:', error)
    }

    // Measure FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          console.log('FID:', entry.processingStart - entry.startTime, 'ms')
          
          // Report to analytics if available
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Performance',
            })
          }
        })
      })
      
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('Could not measure FID:', error)
    }

    // Measure CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        console.log('CLS:', clsValue)
        
        // Report to analytics if available
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance',
          })
        }
      })
      
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Could not measure CLS:', error)
    }
  }
}