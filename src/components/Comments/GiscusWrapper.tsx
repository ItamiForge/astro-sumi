/**
 * React wrapper for Giscus component with error boundary support
 *
 * This component provides error handling for the Giscus comment system,
 * ensuring graceful degradation when the external service fails.
 */

import { useEffect, useRef, useState } from 'react'
import { ExternalServiceErrorBoundary } from '../ui/error-boundary'
import type {
  GiscusConfig,
  NovelCommentConfig,
  ChapterCommentConfig,
} from './types'

interface GiscusWrapperProps {
  config: GiscusConfig
  novelConfig?: NovelCommentConfig
  chapterConfig?: ChapterCommentConfig
  className?: string
  syncTheme?: boolean
  lightTheme?: string
  darkTheme?: string
}

/**
 * Internal Giscus component that handles the actual loading
 */
function GiscusInternal({
  config,
  novelConfig,
  chapterConfig,
  className = '',
  syncTheme = true,
  lightTheme = 'fro',
  darkTheme = 'dark',
}: GiscusWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Check if comments are disabled
    const commentsEnabled =
      novelConfig?.enabled !== false &&
      chapterConfig?.enabled !== false &&
      config.enabled

    if (!commentsEnabled) {
      return
    }

    // Clear any existing content
    containerRef.current.innerHTML = ''

    let observer: MutationObserver | null = null
    let themeObserver: MutationObserver | null = null

    try {
      // Create script element
      const script = document.createElement('script')
      script.src = 'https://giscus.app/client.js'
      script.setAttribute('data-repo', config.repo)
      script.setAttribute('data-repo-id', config.repoId)
      script.setAttribute('data-category', config.category)
      script.setAttribute('data-category-id', config.categoryId)
      script.setAttribute('data-mapping', config.mapping)
      script.setAttribute('data-strict', config.strict)
      script.setAttribute('data-reactions-enabled', config.reactionsEnabled)
      script.setAttribute('data-emit-metadata', config.emitMetadata)
      script.setAttribute('data-input-position', config.inputPosition)
      script.setAttribute('data-theme', config.theme)
      script.setAttribute('data-lang', config.lang)
      script.setAttribute('data-loading', config.loading)
      script.crossOrigin = 'anonymous'
      script.async = true

      // Handle script load events
      script.onload = () => {
        setLoadError(null)
      }

      script.onerror = () => {
        setLoadError('Failed to load Giscus script')
      }

      // Add script to container
      containerRef.current.appendChild(script)

      // Set up theme synchronization if enabled
      if (syncTheme) {
        const updateTheme = () => {
          const currentTheme =
            document.documentElement.getAttribute('data-theme')
          const giscusTheme = currentTheme === 'dark' ? darkTheme : lightTheme

          const giscusFrame = containerRef.current?.querySelector(
            'iframe.giscus-frame',
          ) as HTMLIFrameElement
          if (giscusFrame) {
            const message = {
              type: 'set-theme',
              theme: giscusTheme,
            }
            giscusFrame.contentWindow?.postMessage(
              { giscus: message },
              'https://giscus.app',
            )
          }
        }

        // Watch for Giscus iframe to load
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              const giscusFrame = containerRef.current?.querySelector(
                'iframe.giscus-frame',
              )
              if (giscusFrame) {
                setTimeout(updateTheme, 1000)
                observer?.disconnect()
              }
            }
          })
        })

        if (containerRef.current) {
          observer.observe(containerRef.current, {
            childList: true,
            subtree: true,
          })
        }

        // Listen for theme changes
        themeObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === 'data-theme'
            ) {
              updateTheme()
            }
          })
        })

        themeObserver.observe(document.documentElement, { attributes: true })
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }

    // Cleanup function
    return () => {
      observer?.disconnect()
      themeObserver?.disconnect()
    }
  }, [config, novelConfig, chapterConfig, syncTheme, lightTheme, darkTheme])

  // Check if comments are disabled
  const commentsEnabled =
    novelConfig?.enabled !== false &&
    chapterConfig?.enabled !== false &&
    config.enabled

  if (!commentsEnabled) {
    return (
      <div
        className={`comments-disabled mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${className}`}
      >
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Comments are disabled for this content.
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className={`comments-error mt-8 rounded-lg border border-red-200 p-4 dark:border-red-700 ${className}`}
      >
        <div className="text-center">
          <div className="mb-2 text-red-500">
            <svg
              className="mx-auto h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Unable to load comments
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {loadError}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`giscus-wrapper mt-8 w-full ${className}`}
      data-sync-theme={syncTheme}
      data-light-theme={lightTheme}
      data-dark-theme={darkTheme}
    />
  )
}

/**
 * Main Giscus wrapper component with error boundary
 */
export function GiscusWrapper(props: GiscusWrapperProps) {
  const handleError = (error: Error) => {
    // Log error for debugging
    console.error('Giscus component error:', error)
  }

  const fallback = (
    <div
      className={`comments-fallback mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${props.className || ''}`}
    >
      <div className="text-center">
        <div className="mb-2 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comments are temporarily unavailable
        </p>
      </div>
    </div>
  )

  return (
    <ExternalServiceErrorBoundary
      serviceName="Giscus Comments"
      fallback={fallback}
      onError={handleError}
    >
      <GiscusInternal {...props} />
    </ExternalServiceErrorBoundary>
  )
}

export default GiscusWrapper
