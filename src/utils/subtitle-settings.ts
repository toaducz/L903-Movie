import { SubtitleSettings } from '@/types/subtitle'

const STORAGE_KEY = 'subtitle_settings'

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  bottomOffset: 8,       // 8% từ dưới lên
  sub1Color: '#ffffff',  // trắng
  sub2Color: '#fde047',  // vàng (yellow-300)
  bgColor: 'transparent' // không nền
}

export function getSubtitleSettings(): SubtitleSettings {
  if (typeof window === 'undefined') return DEFAULT_SUBTITLE_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SUBTITLE_SETTINGS
    return { ...DEFAULT_SUBTITLE_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SUBTITLE_SETTINGS
  }
}

export function saveSubtitleSettings(settings: SubtitleSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
