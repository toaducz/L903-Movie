// phải viết proxy vì bị CORS không có content-type: application/json
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get('url')
  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  const cookieHeader = req.headers.get('cookie')
  const headers = cookieHeader ? { cookie: cookieHeader } : undefined

  const res = await fetch(targetUrl, { headers })
  const contentType = res.headers.get('content-type') ?? ''

  // Trả về text thẳng nếu không phải JSON (ví dụ: file .srt)
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': contentType || 'text/plain; charset=utf-8' }
    })
  }

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
