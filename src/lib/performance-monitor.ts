/**
 * Performance Monitoring Utilities
 * Monitors and optimizes Core Web Vitals
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

class PerformanceMonitor {
  private metrics: WebVitalMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    this.observeLCP()
    
    // First Input Delay (FID)
    this.observeFID()
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // First Contentful Paint (FCP)
    this.observeFCP()
    
    // Time to First Byte (TTFB)
    this.observeTTFB()
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        if (lastEntry) {
          const value = lastEntry.startTime
          this.recordMetric({
            name: 'LCP',
            value,
            rating: this.rateLCP(value),
            timestamp: Date.now(),
          })
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Could not observe LCP:', error)
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const value = entry.processingStart - entry.startTime
          this.recordMetric({
            name: 'FID',
            value,
            rating: this.rateFID(value),
            timestamp: Date.now(),
          })
        })
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Could not observe FID:', error)
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          rating: this.rateCLS(clsValue),
          timestamp: Date.now(),
        })
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Could not observe CLS:', error)
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const value = entry.startTime
          this.recordMetric({
            name: 'FCP',
            value,
            rating: this.rateFCP(value),
            timestamp: Date.now(),
          })
        })
      })
      
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Could not observe FCP:', error)
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const value = entry.responseStart - entry.requestStart
          this.recordMetric({
            name: 'TTFB',
            value,
            rating: this.rateTTFB(value),
            timestamp: Date.now(),
          })
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Could not observe TTFB:', error)
    }
  }

  private recordMetric(metric: WebVitalMetric) {
    this.metrics.push(metric)
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
    }
    
    // Report to analytics in production
    if (!import.meta.env.DEV && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'web_vitals', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        event_category: 'Performance',
      })
    }
  }

  // Rating functions based on Core Web Vitals thresholds
  private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1200) return 'good'
    if (value <= 2500) return 'needs-improvement'
    return 'poor'
  }

  private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 50) return 'good'
    if (value <= 100) return 'needs-improvement'
    return 'poor'
  }

  private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.05) return 'good'
    if (value <= 0.1) return 'needs-improvement'
    return 'poor'
  }

  private rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1000) return 'good'
    if (value <= 2000) return 'needs-improvement'
    return 'poor'
  }

  private rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 200) return 'good'
    if (value <= 500) return 'needs-improvement'
    return 'poor'
  }

  // Public methods
  getMetrics(): WebVitalMetric[] {
    return [...this.metrics]
  }

  getLatestMetric(name: WebVitalMetric['name']): WebVitalMetric | undefined {
    return this.metrics
      .filter(metric => metric.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  getPerformanceScore(): number {
    const latestMetrics = {
      LCP: this.getLatestMetric('LCP'),
      FID: this.getLatestMetric('FID'),
      CLS: this.getLatestMetric('CLS'),
    }

    const scores = Object.values(latestMetrics)
      .filter(Boolean)
      .map(metric => {
        switch (metric!.rating) {
          case 'good': return 100
          case 'needs-improvement': return 75
          case 'poor': return 50
          default: return 0
        }
      })

    return scores.length > 0 
      ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length)
      : 0
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export utility functions
export function optimizeForLCP() {
  // Preload critical resources
  const criticalResources = [
    '/fonts/GeistVF.woff2',
    '/fonts/GeistMonoVF.woff2',
    '/static/logo.svg',
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.includes('.woff') ? 'font' : 'image'
    if (resource.includes('.woff')) {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

export function optimizeForFID() {
  // Defer non-critical JavaScript
  const scripts = document.querySelectorAll('script[data-defer]')
  scripts.forEach(script => {
    if (script instanceof HTMLScriptElement) {
      script.defer = true
    }
  })
}

export function optimizeForCLS() {
  // Add aspect ratios to images without them
  const images = document.querySelectorAll('img:not([style*="aspect-ratio"])')
  images.forEach(img => {
    if (img instanceof HTMLImageElement && img.width && img.height) {
      img.style.aspectRatio = `${img.width} / ${img.height}`
    }
  })
}