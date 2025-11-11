/**
 * Lazy-loaded ScrollArea component for better performance with error boundary
 */
import { lazy, Suspense } from 'react'
import { UIErrorBoundary } from './error-boundary'

// Lazy load the ScrollArea component
const ScrollArea = lazy(() =>
  import('./scroll-area').then((module) => ({ default: module.ScrollArea })),
)

interface LazyScrollAreaProps {
  fallback?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function LazyScrollArea({
  fallback = <div>Loading...</div>,
  ...props
}: LazyScrollAreaProps) {
  // Error fallback for scroll area loading failures
  const errorFallback = (
    <div className="h-full w-full overflow-auto" {...props}>
      {props.children}
    </div>
  )

  return (
    <UIErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <ScrollArea {...props} />
      </Suspense>
    </UIErrorBoundary>
  )
}

export default LazyScrollArea
