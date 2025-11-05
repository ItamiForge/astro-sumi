/**
 * Page-level error boundary component
 *
 * This component provides error handling for entire pages,
 * ensuring the site remains functional even when individual pages fail.
 */

import React from 'react'
import { ErrorBoundary } from './ui/error-boundary'

interface PageErrorBoundaryProps {
  children: React.ReactNode
  pageName?: string
}

export function PageErrorBoundary({
  children,
  pageName,
}: PageErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log page-level errors with additional context
    console.error(`Page error in ${pageName || 'unknown page'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      pageName,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    })
  }

  const fallback = (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-md p-6">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>

          <p className="mb-6 text-gray-600 dark:text-gray-400">
            We encountered an error while loading this page. This might be a
            temporary issue.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Reload Page
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Go Back
            </button>

            <a
              href="/"
              className="block w-full px-4 py-2 text-center text-blue-500 underline hover:text-blue-600"
            >
              Return to Home
            </a>
          </div>

          {pageName && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Error occurred in: {pageName}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}

export default PageErrorBoundary
