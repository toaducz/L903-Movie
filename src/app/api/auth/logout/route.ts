import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const res = NextResponse.json({ message: 'Logged out' })

  res.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
  res.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })
  return res
}
