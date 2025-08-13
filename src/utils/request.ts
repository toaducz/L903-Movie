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

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(`${apiUrl}${endpoint}${params}`)}`

  const res = await fetch(proxyUrl)
  try {
    return (await res.json()) as T
  } catch (e) {
    console.error('Parse JSON error', e)
    return null
  }
}
