/**
 * Prepends the base URL to internal paths
 * Use this for any href/src that needs to work with GitHub Pages base path
 */
export function withBase(path: string): string {
  // Don't modify external URLs, anchors, or mailto links
  if (
    path.startsWith('http') ||
    path.startsWith('mailto:') ||
    path.startsWith('#')
  ) {
    return path
  }

  const base = import.meta.env.BASE_URL
  
  // Special case: root path should return base without extra trailing slash
  if (path === '/') {
    return base
  }
  
  // Ensure base ends with / and path doesn't start with /
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `${cleanBase}${cleanPath}`
}
