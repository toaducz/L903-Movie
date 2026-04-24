import { SubtitleCue } from '@/types/subtitle'

function timeToSeconds(h: string, m: string, s: string, ms: string): number {
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000
}

/** Parse raw SRT text → mảng SubtitleCue (đã sort theo start) */
export function parseSrt(raw: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const blocks = raw.trim().replace(/\r\n/g, '\n').split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 2) continue

    const timeLine = lines.find(l => l.includes('-->'))
    if (!timeLine) continue

    // Hỗ trợ cả SRT (dấu phẩy) lẫn VTT (dấu chấm) cho ms separator
    const timeMatch = timeLine.match(
      /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})/
    )
    if (!timeMatch) continue

    const start = timeToSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
    const end = timeToSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8])

    const timeLineIdx = lines.indexOf(timeLine)
    const text = lines
      .slice(timeLineIdx + 1)
      .join('\n')
      .replace(/<[^>]+>/g, '')   // strip HTML tags (màu, in đậm...)
      .replace(/\{[^}]+\}/g, '') // strip ASS/SSA tags
      .trim()

    if (text) cues.push({ start, end, text })
  }

  // Đảm bảo sort theo thời gian (một số file SRT không sort đúng)
  return cues.sort((a, b) => a.start - b.start)
}

/**
 * Binary search O(log n) — tìm câu sub đang active tại thời điểm `time` giây.
 * Trả về text nếu tìm thấy, null nếu không có sub nào khớp.
 */
export function findActiveSub(cues: SubtitleCue[], time: number): string | null {
  if (!cues.length) return null
  let lo = 0
  let hi = cues.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const cue = cues[mid]
    if (time < cue.start) hi = mid - 1
    else if (time > cue.end) lo = mid + 1
    else return cue.text
  }
  return null
}
