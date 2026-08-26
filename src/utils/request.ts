export async function request<T>(
  apiUrl: string, // nhận base API_URL từ parameter
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  payload?: Record<string, unknown>
): Promise<T | null> {
  let params = ''
  if (method === 'GET' && payload) {
    params = '?' + new URLSearchParams(payload as Record<string, string>).toString()
  }

  const cleanApiUrl = apiUrl.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.replace(/^\/+/, '')
  const fullUrl = `${cleanApiUrl}/${cleanEndpoint}${params}`

  // 1. Gọi trực tiếp từ trình duyệt (Client-side):
  // Các API như NguonC (phim.nguonc.com) và KKPhim (phimapi.com) đều trả về header `Access-Control-Allow-Origin: *`.
  // Việc gọi trực tiếp từ browser sử dụng IP dân cư của người dùng, giúp vượt qua hoàn toàn Cloudflare WAF
  // (Cloudflare WAF sẽ chặn HTTP 403 nếu request đi qua IP datacenter của Vercel Serverless).
  try {
    const directRes = await fetch(fullUrl, {
      method,
      headers: {
        Accept: 'application/json'
      }
    })
    if (directRes.ok) {
      return (await directRes.json()) as T
    }
  } catch {
    // Nếu gọi trực tiếp gặp lỗi CORS hoặc network thì fallback sang proxy
  }

  // 2. Fallback sang proxy nội bộ nếu gọi trực tiếp không thành công
  if (typeof window !== 'undefined') {
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(fullUrl)}`
      const res = await fetch(proxyUrl)
      if (res.ok) {
        return (await res.json()) as T
      }
    } catch (e) {
      console.error('Proxy request error:', fullUrl, e)
    }
  }

  return null
}
