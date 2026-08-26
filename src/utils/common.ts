export const getOphimImageMovie = (appDomain?: string | null, thumb_url?: string | null) => {
  if (!thumb_url) return null
  const trimmed = String(thumb_url).trim()
  if (trimmed === '' || trimmed === '{}') return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed

  const rawDomain = (appDomain && appDomain.trim()) || 'https://img.ophim.live'
  const cleanDomain = rawDomain.replace(/\/+$/, '').replace(/\/uploads\/movies$/i, '')
  const cleanPath = trimmed.replace(/^\/+/, '')

  if (cleanPath.startsWith('uploads/movies/')) {
    return `${cleanDomain}/${cleanPath}`
  }
  return `${cleanDomain}/uploads/movies/${cleanPath}`
}

export const getOptimizedImage = (
  thumbUrl: string | undefined,
  posterUrl: string | undefined,
  priority: 'thumb' | 'poster' = 'poster'
) => {
  const images = priority === 'thumb' ? [thumbUrl, posterUrl] : [posterUrl, thumbUrl]

  const poster =
    images
      .map(u => {
        if (!u || typeof u === 'object') return null
        const s = String(u).trim()
        if (s === '{}' || s === '') return null
        return s.startsWith('http://') || s.startsWith('https://') ? s : `https://phimimg.com/${s.replace(/^\/+/, '')}`
      })
      .find(Boolean) ?? null

  return poster || null
}
