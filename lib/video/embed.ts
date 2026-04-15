// Convert a pasted YouTube or Loom URL into an embeddable URL.
// Returns null if the URL isn't from a supported provider.

export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const u = new URL(trimmed)
    const host = u.hostname.replace(/^www\./, '')

    // YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      const shortsMatch = u.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)/)
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`
      const embedMatch = u.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)/)
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`
    }
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // Loom
    if (host === 'loom.com' || host.endsWith('.loom.com')) {
      const shareMatch = u.pathname.match(/^\/(?:share|embed)\/([A-Za-z0-9]+)/)
      if (shareMatch) return `https://www.loom.com/embed/${shareMatch[1]}`
    }
  } catch {
    return null
  }
  return null
}

export function videoProvider(url: string | null | undefined): 'youtube' | 'loom' | null {
  if (!url) return null
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host.includes('youtube') || host === 'youtu.be') return 'youtube'
    if (host.includes('loom.com')) return 'loom'
  } catch {}
  return null
}
