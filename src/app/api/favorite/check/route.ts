import { NextResponse } from "next/server"
import { supabase } from "../../../../../lib/supabaseClient"

export async function POST(req: Request) {
  const { user_id, slug } = await req.json()
  const { data, error } = await supabase
    .from("favorite")
    .select("id")
    .eq("user_id", user_id)
    .eq("slug", slug)
    .maybeSingle()

  return NextResponse.json({
    exists: !!data,
    error,
  })
}