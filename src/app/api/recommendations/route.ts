import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 })
  }

  const { history } = await req.json()
  if (!history || !Array.isArray(history) || history.length === 0) {
    return NextResponse.json({ movies: [] })
  }

  const movieList = (history as string[]).slice(0, 15).join('\n')

  const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Người dùng đã xem các phim sau:\n${movieList}\n\nGợi ý đúng 3 phim khác mà người dùng có thể thích (không trùng với danh sách trên). Chỉ trả về đúng 3 tên phim, mỗi tên trên một dòng riêng, không đánh số, không giải thích, không có ký tự đặc biệt.`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
    }),
  })

  if (!geminiRes.ok) {
    return NextResponse.json({ movies: [] })
  }

  const geminiData = await geminiRes.json()
  const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const suggestions = text
    .split('\n')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 3)

  const movies = await Promise.all(
    suggestions.map(async (name: string) => {
      const res = await fetch(
        `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(name)}&page=1&limit=1`
      )
      const data = await res.json()
      return data?.data?.items?.[0] ?? null
    })
  )

  return NextResponse.json({ movies: movies.filter(Boolean) })
}
