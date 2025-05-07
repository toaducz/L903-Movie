// phải viết proxy vì bị CORS không có content-type: application/json
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get('url')
  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  const res = await fetch(targetUrl)
  const data = await res.json()

  return NextResponse.json(data)
}
