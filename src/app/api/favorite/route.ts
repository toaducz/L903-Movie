import { NextResponse } from "next/server"
import { supabase } from "../../../../lib/supabaseClient"

// Thêm vào yêu thích
export async function POST(req: Request) {
  const { user_id, slug } = await req.json()
  const { data, error } = await supabase.from("favorite").insert([{ user_id, slug }])
  return NextResponse.json({ data, error })
}

// Xoá khỏi yêu thích
export async function DELETE(req: Request) {
  const { user_id, slug } = await req.json()
  const { data, error } = await supabase
    .from("favorite")
    .delete()
    .eq("user_id", user_id)
    .eq("slug", slug)

  return NextResponse.json({ data, error })
}

// Lấy danh sách yêu thích (có phân trang)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get("user_id")
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from("favorite")
    .select("*", { count: "exact" })
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to)

  return NextResponse.json({
    data,
    count,
    page,
    totalPages: count ? Math.ceil(count / limit) : 1,
    error,
  })
}
