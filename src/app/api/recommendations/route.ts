import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function searchKKPhim(name: string) {
  const norm = (u: string, cdn: string) => {
    if (!u) return ''
    if (u.startsWith('http')) return u
    return `${cdn.replace(/\/+$/, '')}/${u.replace(/^\/+/, '')}`
  }

  // thử tìm full tên trước
  const res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(name)}&page=1&limit=1`)
  const data = await res.json()
  const raw = data?.data?.items?.[0]
  if (raw) {
    const cdn = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com'
    return {
      ...raw,
      poster_url: norm(raw.thumb_url, cdn),
      thumb_url: norm(raw.poster_url, cdn),
      source: 'kkphim'
    }
  }

  // fallback: tìm với 2-3 từ đầu
  const shortName = name.split(/[\s:,]/)[0]
  if (shortName === name) return null
  const res2 = await fetch(
    `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(shortName)}&page=1&limit=1`
  )
  const data2 = await res2.json()
  const raw2 = data2?.data?.items?.[0]
  if (raw2) {
    const cdn = data2?.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com'
    return {
      ...raw2,
      poster_url: norm(raw2.thumb_url, cdn),
      thumb_url: norm(raw2.poster_url, cdn),
      source: 'kkphim'
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Groq API key' }, { status: 500 })
  }

  const { history } = await req.json()
  if (!history || !Array.isArray(history) || history.length === 0) {
    return NextResponse.json({ movies: [] })
  }

  const movieList = (history as string[]).slice(0, 15).join('\n')

  const groqRes = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Người dùng đã xem: ${movieList}\n\nHãy gợi ý ĐÚNG 5 bộ phim nổi tiếng khác phù hợp, đa dạng thể loại, không chỉ anime. Mỗi gợi ý phải dựa trên một phim khác nhau trong danh sách trên. Trả lời theo định dạng:\nTên phim 1\nTên phim 2\nTên phim 3\nTên phim 4\nTên phim 5\n\nChỉ trả về 5 dòng tên phim bằng tiếng Việt, không có gì khác.`
        }
      ],
      temperature: 0.7
      // max_tokens: 200,
    })
  })

  if (!groqRes.ok) {
    const errText = await groqRes.text()
    console.error('[recommendations] Groq error:', groqRes.status, errText)
    return NextResponse.json({ movies: [] })
  }

  const groqData = await groqRes.json()
  const text: string = groqData?.choices?.[0]?.message?.content ?? ''
  console.log('[recommendations] Groq suggestions:', text) // in này ra chi vậy :D?

  const suggestions = text
    .split('\n')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 5)

  // search song song, lấy 3 cái đầu tìm thấy
  const results = await Promise.all(suggestions.map(searchKKPhim))
  const movies = results.filter(Boolean).slice(0, 3)

  return NextResponse.json({ movies })
}
