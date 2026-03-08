type Movie = {
  name: string
  image: string
  slug: string
}

const STORAGE_KEY = 'viewHistory'
const EXPIRE_DAYS = 30

export function saveViewHistory(movie: Movie) {
  if (typeof window === 'undefined') return

  const now = Date.now()
  const expireAt = now + EXPIRE_DAYS * 24 * 60 * 60 * 1000

  let history: { data: Movie; expireAt: number }[] = []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history = JSON.parse(stored)

      // lọc bỏ item hết hạn hoặc có dữ liệu rỗng
      history = history.filter(
        item =>
          item.expireAt > now &&
          item.data &&
          item.data.name.trim() !== '' &&
          item.data.image.trim() !== '' &&
          item.data.slug.trim() !== ''
      )
    }
  } catch (e) {
    console.error('Parse history failed', e)
  }

  // xóa trùng
  history = history.filter(item => item.data.slug !== movie.slug)

  // thêm lại
  history.unshift({ data: movie, expireAt })

  // 50 cái
  if (history.length > 50) {
    history = history.slice(0, 50)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function saveWatchProgress(key: string, time: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`watchProgress_${key}`, String(time))
  } catch {}
}

export function getWatchProgress(key: string): number {
  if (typeof window === 'undefined') return 0
  try {
    return Number(localStorage.getItem(`watchProgress_${key}`)) || 0
  } catch {
    return 0
  }
}

export function clearWatchProgress(key: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`watchProgress_${key}`)
  } catch {}
}

export function getViewHistory(): Movie[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const now = Date.now()
    let history: { data: Movie; expireAt: number }[] = JSON.parse(stored)

    // lọc bỏ item hết hạn hoặc có dữ liệu rỗng
    history = history.filter(
      item =>
        item.expireAt > now &&
        item.data &&
        item.data.name.trim() !== '' &&
        item.data.image.trim() !== '' &&
        item.data.slug.trim() !== ''
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))

    return history.map(item => item.data)
  } catch {
    return []
  }
}
