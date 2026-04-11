import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'
import { getUserId } from '../../../lib/auth-helper'

async function getSession(req: NextRequest) {
  const access_token = req.cookies.get('sb-access-token')?.value
  const refresh_token = req.cookies.get('sb-refresh-token')?.value
  if (!access_token) {
    return NextResponse.json({ error: 'Không xác thực được' }, { status: 401 })
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token || ''
  })
  if (sessionError) {
    console.error('Lỗi thiết lập phiên:', sessionError.message, sessionError)
    return NextResponse.json({ error: 'Không thể thiết lập phiên', details: sessionError.message }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  await getSession(req)
  const user_id = await getUserId(req)
  if (!user_id) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 })
  }

  const { slug, name, image, score, review_text, user_email } = await req.json()
  if (!slug || score === undefined || !review_text) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  // Sử dụng upsert để cập nhật review nếu đã tồn tại
  const { data, error } = await supabase
    .from('movie_reviews')
    .upsert(
      {
        user_id,
        user_email: user_email || 'Người dùng ẩn danh',
        slug,
        name,
        image,
        score,
        review_text,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id, slug' }
    )

  if (error) {
    console.error('Lỗi Supabase:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, success: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const my_reviews = searchParams.get('my_reviews')

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const from = (page - 1) * limit
  const to = from + limit - 1

  if (my_reviews === '1') {
    await getSession(req)
    const user_id = await getUserId(req)
    if (!user_id) return NextResponse.json({ error: 'Không xác thực được' }, { status: 401 })

    const { data, error, count } = await supabase
      .from('movie_reviews')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Lỗi Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      count,
      page,
      totalPages: count ? Math.ceil(count / limit) : 1
    })
  }

  if (slug) {
    const { data, error, count } = await supabase
      .from('movie_reviews')
      .select('*', { count: 'exact' })
      .eq('slug', slug)
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Lỗi Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      count,
      page,
      totalPages: count ? Math.ceil(count / limit) : 1
    })
  }

  return NextResponse.json({ error: 'Bắt buộc phải có slug hoặc my_reviews=1' }, { status: 400 })
}
