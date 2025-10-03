import { NextRequest } from 'next/server'
import { supabase } from './supabaseClient'

// Lấy user_id từ cookie token
export async function getUserId(req: NextRequest) {
  const access_token = req.cookies.get('sb-access-token')?.value
  if (!access_token) return null

  const { data, error } = await supabase.auth.getUser(access_token)
  if (error || !data.user) return null
  return data.user.id
}
