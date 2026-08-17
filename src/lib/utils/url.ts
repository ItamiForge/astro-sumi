/**
 * Prefix internal paths with the site base (GitHub Pages uses `/astro-sumi`).
 * Leave http(s), mailto, and in-page hashes unchanged.
 */
export function withBase(path: string): string {
  if (
    path.startsWith('http') ||
    path.startsWith('mailto:') ||
    path.startsWith('#')
  ) {
    return path
  }

  const base = import.meta.env.BASE_URL

  if (path === '/') {
    return base
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `${cleanBase}${cleanPath}`
}
