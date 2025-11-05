/**
 * Lazy-loaded Avatar component for better performance with error boundary
 */
import { lazy, Suspense } from 'react'
import { UIErrorBoundary } from './error-boundary'

// Lazy load the Avatar component
const Avatar = lazy(() =>
  import('./avatar').then((module) => ({ default: module.default })),
)

interface LazyAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
  children?: React.ReactNode
}

export function LazyAvatar({
  fallback: fallbackProp,
  className,
  ...props
}: LazyAvatarProps) {
  // Create a simple fallback that matches the avatar style
  const defaultFallback = (
    <div
      className={`bg-muted text-muted-foreground inline-flex items-center justify-center rounded-full ${className || ''}`}
      style={{ width: '2rem', height: '2rem' }}
    >
      {fallbackProp || '?'}
    </div>
  )

  // Error fallback for avatar loading failures
  const errorFallback = (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 ${className || ''}`}
      style={{ width: '2rem', height: '2rem' }}
      title="Avatar failed to load"
    >
      {fallbackProp || '?'}
    </div>
  )

  return (
    <UIErrorBoundary fallback={errorFallback}>
      <Suspense fallback={defaultFallback}>
        <Avatar
          {...props}
          className={className}
          fallback={fallbackProp || '?'}
        />
      </Suspense>
    </UIErrorBoundary>
  )
}

export default LazyAvatar
