/**
 * Service Worker Registration
 * Registers the service worker for offline functionality and caching
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  // Only register in production
  if (import.meta.env.DEV) {
    console.log('Service Worker: Skipping registration in development mode')
    return
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker: Registered successfully', registration)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('Service Worker: New version available')
            
            // Optionally show update notification to user
            showUpdateNotification(registration)
          }
        })
      })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          showUpdateNotification(registration)
        }
      })

    } catch (error) {
      console.error('Service Worker: Registration failed', error)
    }
  })
}

/**
 * Show update notification to user
 */
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Create a simple notification
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 300px;
    ">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: hsl(var(--foreground));">
        A new version is available!
      </p>
      <button id="sw-update-btn" style="
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 12px;
        cursor: pointer;
        margin-right: 8px;
      ">
        Update
      </button>
      <button id="sw-dismiss-btn" style="
        background: transparent;
        color: hsl(var(--muted-foreground));
        border: 1px solid hsl(var(--border));
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 12px;
        cursor: pointer;
      ">
        Dismiss
      </button>
    </div>
  `

  document.body.appendChild(notification)

  // Handle update button click
  const updateBtn = notification.querySelector('#sw-update-btn')
  updateBtn?.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  })

  // Handle dismiss button click
  const dismissBtn = notification.querySelector('#sw-dismiss-btn')
  dismissBtn?.addEventListener('click', () => {
    document.body.removeChild(notification)
  })

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 10000)
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
    console.log('Service Worker: Unregistered all service workers')
  }
}