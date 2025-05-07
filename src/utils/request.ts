export async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  payload?: Record<string, unknown>
): Promise<T | null> {
  let params = ''
  if (method === 'GET' && payload) {
    params = '?' + new URLSearchParams(payload as Record<string, string>).toString()
  }

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(`https://phimapi.com/${endpoint}${params}`)}`

  const res = await fetch(proxyUrl)
  try {
    return (await res.json()) as T
  } catch (e) {
    console.error('Parse JSON error', e)
    return null
  }
}
