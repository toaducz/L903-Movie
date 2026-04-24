import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { SubtitleParams, SubtitleResponse, SubtitleErrorResponse } from '@/types/subtitle'
import { proxyApiUrl } from '@/utils/env'

// params = null khi chưa đủ điều kiện (chưa load xong data, không đang watch)
// queryOptions tự disable để không fire request
export const getSubtitles = (params: SubtitleParams | null) => {
  const payload: Record<string, string> = params ? { tmdb_id: params.tmdbId } : {}
  if (params?.type === 'series') {
    payload.s = String(params.season)
    payload.e = String(params.episode)
  }

  return queryOptions({
    queryKey: [
      'get-subtitles',
      params?.tmdbId ?? null,
      params?.type ?? null,
      params?.type === 'series' ? params.season : 0,
      params?.type === 'series' ? params.episode : 0
    ],
    queryFn: async () => {
      const result = await request<SubtitleResponse | SubtitleErrorResponse>(
        proxyApiUrl,
        '/api/subtitles',
        'GET',
        payload
      )
      // Không kết nối được (network error, parse fail)
      if (!result) throw new Error('Không thể kết nối đến subtitle proxy')
      // Worker trả về ErrorResponse (401, 404, 500, ...)
      if ('error' in result) throw new Error(result.details ?? result.error)
      return result
    },
    enabled: params !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1
  })
}
