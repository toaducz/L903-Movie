// ─── Types đồng bộ với L903-Movie-proxy/src/types.ts ────────────────────────

export interface SubFile {
  id: string
  url: string
}

export interface SubtitleResponse {
  tmdb_id: string
  imdb_id: string
  type: 'movie' | 'series'
  // Grouped by language code (e.g. 'en', 'vi')
  available_subs: Record<string, SubFile[]>
}

export interface SubtitleErrorResponse {
  error: string
  details?: string
}

// ─── Params truyền vào fetcher ───────────────────────────────────────────────

export type SubtitleMovieParams = {
  tmdbId: string
  type: 'movie'
}

export type SubtitleSeriesParams = {
  tmdbId: string
  type: 'series'
  season: number
  episode: number
}

export type SubtitleParams = SubtitleMovieParams | SubtitleSeriesParams

// ─── Parsed subtitle cue (client-side) ──────────────────────────────────────

export interface SubtitleCue {
  start: number // giây
  end: number   // giây
  text: string
}

// ─── Cài đặt hiển thị phụ đề (lưu localStorage) ─────────────────────────────

export interface SubtitleSettings {
  bottomOffset: number  // % từ dưới màn hình lên (5–70)
  sub1Color: string     // CSS color cho Sub 1 (mặc định: trắng)
  sub2Color: string     // CSS color cho Sub 2 (mặc định: vàng)
  bgColor: string       // CSS background-color cho text box
}
