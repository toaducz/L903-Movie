'use client'

import { useState } from 'react'
import { SubtitleResponse, SubtitleCue } from '@/types/subtitle'
import { parseSrt } from '@/utils/parse-srt'

// ISO 639-2 (3 chữ cái) + ISO 639-1 (2 chữ cái) fallback
const LANG_META: Record<string, string> = {
  vie: 'Tiếng Việt', eng: 'Tiếng Anh', zho: 'Tiếng Trung', chi: 'Tiếng Trung',
  kor: 'Tiếng Hàn', jpn: 'Tiếng Nhật', fra: 'Tiếng Pháp', fre: 'Tiếng Pháp',
  spa: 'Tiếng Tây Ban Nha', spl: 'Tiếng Tây Ban Nha (Latinh)',
  ger: 'Tiếng Đức', por: 'Tiếng Bồ Đào Nha', pob: 'Tiếng Bồ Đào Nha (Brazil)',
  tha: 'Tiếng Thái', ind: 'Tiếng Indonesia', rus: 'Tiếng Nga', ara: 'Tiếng Ả Rập',
  ben: 'Tiếng Bengal', bul: 'Tiếng Bulgaria', bur: 'Tiếng Miến Điện',
  cze: 'Tiếng Séc', ell: 'Tiếng Hy Lạp', est: 'Tiếng Estonia',
  fin: 'Tiếng Phần Lan', heb: 'Tiếng Do Thái', hrv: 'Tiếng Croatia',
  hun: 'Tiếng Hungary', ita: 'Tiếng Ý', nld: 'Tiếng Hà Lan',
  nor: 'Tiếng Na Uy', per: 'Tiếng Ba Tư', pol: 'Tiếng Ba Lan',
  ron: 'Tiếng Romania', slv: 'Tiếng Slovenia', swe: 'Tiếng Thụy Điển',
  tur: 'Tiếng Thổ Nhĩ Kỳ', lb: 'Tiếng Luxembourg',
  // 2-letter fallback
  vi: 'Tiếng Việt', en: 'Tiếng Anh', zh: 'Tiếng Trung', ko: 'Tiếng Hàn',
  ja: 'Tiếng Nhật', fr: 'Tiếng Pháp', es: 'Tiếng Tây Ban Nha',
  de: 'Tiếng Đức', pt: 'Tiếng Bồ Đào Nha', th: 'Tiếng Thái',
  id: 'Tiếng Indonesia', ru: 'Tiếng Nga', ar: 'Tiếng Ả Rập'
}

function getLangLabel(code: string) {
  return LANG_META[code] ?? code.toUpperCase()
}

async function fetchAndParseSrt(srtUrl: string): Promise<SubtitleCue[]> {
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(srtUrl)}`
    const res = await fetch(proxyUrl)
    if (!res.ok) return []
    const text = await res.text()
    return parseSrt(text)
  } catch {
    return []
  }
}

type Props = {
  data: SubtitleResponse | null
  isLoading: boolean
  errorMessage?: string
  isSeasonFallback?: boolean
  onSub1Change?: (cues: SubtitleCue[]) => void
  onSub2Change?: (cues: SubtitleCue[]) => void
}

export default function SubtitleBadges({
  data, isLoading, errorMessage, isSeasonFallback,
  onSub1Change, onSub2Change
}: Props) {
  const [sub1, setSub1] = useState('')
  const [sub2, setSub2] = useState('')
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const langs = data ? Object.keys(data.available_subs) : []

  const handleSub1Change = async (lang: string) => {
    setSub1(lang)
    if (!lang || !data) { onSub1Change?.([]); return }
    setLoading1(true)
    const url = data.available_subs[lang]?.[0]?.url
    const cues = url ? await fetchAndParseSrt(url) : []
    onSub1Change?.(cues)
    setLoading1(false)
  }

  const handleSub2Change = async (lang: string) => {
    setSub2(lang)
    if (!lang || !data) { onSub2Change?.([]); return }
    setLoading2(true)
    const url = data.available_subs[lang]?.[0]?.url
    const cues = url ? await fetchAndParseSrt(url) : []
    onSub2Change?.(cues)
    setLoading2(false)
  }

  const selectClass =
    'text-xs bg-gray-800 border border-gray-600 text-gray-200 rounded px-2 py-0.5 cursor-pointer hover:border-gray-400 transition-colors'

  return (
    <div className='flex flex-wrap items-center gap-2 mt-3 min-h-[28px]'>
      <span className='text-xs text-gray-500 shrink-0'>Phụ đề:</span>

      {isLoading && <span className='text-xs text-gray-500 italic animate-pulse'>Đang tải...</span>}

      {!isLoading && errorMessage && (
        <span title={errorMessage} className='text-xs text-red-400 italic truncate max-w-[240px]'>
          {errorMessage}
        </span>
      )}

      {!isLoading && !errorMessage && langs.length > 0 && (
        <>
          <select value={sub1} onChange={e => handleSub1Change(e.target.value)} className={selectClass}>
            <option value=''>Sub 1 — Tắt</option>
            {langs.map(code => <option key={code} value={code}>{getLangLabel(code)}</option>)}
          </select>
          {loading1 && <span className='text-xs text-gray-400 animate-pulse'>⟳</span>}

          <select value={sub2} onChange={e => handleSub2Change(e.target.value)} className={selectClass}>
            <option value=''>Sub 2 — Tắt</option>
            {langs.map(code => <option key={code} value={code}>{getLangLabel(code)}</option>)}
          </select>
          {loading2 && <span className='text-xs text-gray-400 animate-pulse'>⟳</span>}
        </>
      )}

      {!isLoading && !errorMessage && langs.length === 0 && data !== null && (
        <span className='text-xs text-gray-500 italic'>Không có phụ đề</span>
      )}

      {!isLoading && !errorMessage && data === null && (
        <span className='text-xs text-red-400 italic'>Lỗi tải phụ đề</span>
      )}

      {isSeasonFallback && !isLoading && (
        <span
          title='Không detect được mùa từ tên phim, đang dùng Season 1 mặc định'
          className='text-xs text-yellow-500/80 italic ml-1 cursor-help'
        >
          season 1 (mặc định)
        </span>
      )}
    </div>
  )
}
