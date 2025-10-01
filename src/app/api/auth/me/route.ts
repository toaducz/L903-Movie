// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabaseClient'

export async function GET(req: NextRequest) {
  const access_token = req.cookies.get('sb-access-token')?.value

  if (!access_token) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  const { data, error } = await supabase.auth.getUser(access_token)
  if (error || !data.user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  const safeUser = {
    id: data.user.id,
    email: data.user.email
  }

  return NextResponse.json({ user: safeUser }, { status: 200 })
}
