import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function searchKKPhim(name: string) {
  // thử tìm full tên trước
  const res = await fetch(
    `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(name)}&page=1&limit=1`
  )
  const data = await res.json()
  if (data?.data?.items?.[0]) return data.data.items[0]

  // fallback: tìm với 2-3 từ đầu
  const shortName = name.split(/[\s:,]/)[0]
  if (shortName === name) return null
  const res2 = await fetch(
    `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(shortName)}&page=1&limit=1`
  )
  const data2 = await res2.json()
  return data2?.data?.items?.[0] ?? null
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
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Người dùng đã xem: ${movieList}\n\nHãy gợi ý ĐÚNG 5 bộ phim nổi tiếng khác phù hợp, đa dạng thể loại, không chỉ anime. Mỗi gợi ý phải dựa trên một phim khác nhau trong danh sách trên. Trả lời theo định dạng:\nTên phim 1\nTên phim 2\nTên phim 3\nTên phim 4\nTên phim 5\n\nChỉ trả về 5 dòng tên phim bằng tiếng Việt, không có gì khác.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  })

  if (!groqRes.ok) {
    const errText = await groqRes.text()
    console.error('[recommendations] Groq error:', groqRes.status, errText)
    return NextResponse.json({ movies: [] })
  }

  const groqData = await groqRes.json()
  const text: string = groqData?.choices?.[0]?.message?.content ?? ''
  console.log('[recommendations] Groq suggestions:', text)

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
