import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  // Chạy trên toàn bộ các route ngoại trừ:
  // - API routes (/api)
  // - Static files (_next/static, _next/image)
  // - Các assets (favicon.ico, images, v.v.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')
  const refreshToken = req.cookies.get('sb-refresh-token')
  const isLoginPage = req.nextUrl.pathname === '/login'

  // Trường hợp 1: Chưa đăng nhập (thiếu cả 2 token) mà cố vào các trang nội dung
  if (!token && !refreshToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Trường hợp 2: Đã đăng nhập mà cố vào lại trang login
  if ((token || refreshToken) && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}
