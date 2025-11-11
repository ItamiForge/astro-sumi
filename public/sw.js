/**
 * Service Worker for Astro Sumi
 * Provides offline functionality and asset caching for better performance
 */

const CACHE_NAME = 'astro-sumi-v1'
const STATIC_CACHE_NAME = 'astro-sumi-static-v1'
const DYNAMIC_CACHE_NAME = 'astro-sumi-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/novels/',
  '/authors/',
  '/tags/',
  '/about/',
  '/static/logo-48.webp',
  '/static/logo-96.webp',
  '/static/dark_logo-48.webp',
  '/static/dark_logo-96.webp',
  '/static/background.webp',
  '/static/1200x630.webp',
  '/favicon.svg',
  '/favicon.ico',
  // Add critical CSS and JS files (these will be generated during build)
]

// Cache strategies for different types of requests
const CACHE_STRATEGIES = {
  // Static assets (images, fonts, etc.) - Cache first
  static: [
    /\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$/,
    /\/static\//,
    /\/fonts\//,
  ],
  
  // HTML pages - Network first with cache fallback
  pages: [
    /\/$/,
    /\/novels/,
    /\/authors/,
    /\/tags/,
    /\/about/,
  ],
  
  // API and dynamic content - Network only
  dynamic: [
    /\/api\//,
    /giscus\.app/,
    /github\.com/,
  ],
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('astro-sumi-')) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests (except for allowed domains)
  if (url.origin !== self.location.origin && !isAllowedExternalDomain(url.origin)) {
    return
  }
  
  // Determine cache strategy based on request
  const strategy = getCacheStrategy(request.url)
  
  switch (strategy) {
    case 'static':
      event.respondWith(cacheFirst(request))
      break
    case 'pages':
      event.respondWith(networkFirst(request))
      break
    case 'dynamic':
      event.respondWith(networkOnly(request))
      break
    default:
      event.respondWith(networkFirst(request))
  }
})

// Cache strategies implementation

/**
 * Cache First Strategy - for static assets
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

/**
 * Network First Strategy - for HTML pages
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineResponse = await caches.match('/')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    return new Response('Offline', { status: 503 })
  }
}

/**
 * Network Only Strategy - for dynamic content
 * Always fetch from network
 */
async function networkOnly(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.error('Network Only strategy failed:', error)
    return new Response('Network Error', { status: 503 })
  }
}

// Helper functions

/**
 * Determine cache strategy based on URL
 */
function getCacheStrategy(url) {
  // Check static assets
  for (const pattern of CACHE_STRATEGIES.static) {
    if (pattern.test(url)) {
      return 'static'
    }
  }
  
  // Check dynamic content
  for (const pattern of CACHE_STRATEGIES.dynamic) {
    if (pattern.test(url)) {
      return 'dynamic'
    }
  }
  
  // Check pages
  for (const pattern of CACHE_STRATEGIES.pages) {
    if (pattern.test(url)) {
      return 'pages'
    }
  }
  
  return 'pages' // Default strategy
}

/**
 * Check if external domain is allowed for caching
 */
function isAllowedExternalDomain(origin) {
  const allowedDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]
  
  return allowedDomains.includes(origin)
}

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})