import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabaseClient'

export async function GET(req: NextRequest) {
  const access_token = req.cookies.get('sb-access-token')?.value

  if (!access_token) return NextResponse.json({ id: null })

  const { data, error } = await supabase.auth.getUser(access_token)

  return NextResponse.json({ id: data.user?.id ?? null })
}
