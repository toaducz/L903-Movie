import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { nguonc } from '@/utils/env'
import { mapToDetailMovie } from '@/utils/mapping'

export type CategoryItem = {
  id: string
  name: string
}

export type CategoryGroup = {
  group: {
    id: string
    name: string
  }
  list: CategoryItem[]
}

export type EpisodeItem = {
  name: string
  slug: string
  embed: string
  m3u8: string
}

export type EpisodeNguonc = {
  server_name: string
  items: EpisodeItem[]
}

export type MovieNguonc = {
  id: string
  name: string
  slug: string
  original_name: string
  thumb_url: string
  poster_url: string
  created: string
  modified: string
  description: string
  total_episodes: number
  current_episode: string
  time: string
  quality: string
  language: string
  director: string
  casts: string
  category: Record<string, CategoryGroup>
  episodes: EpisodeNguonc[]
}

type Response = {
  status: string
  movie: MovieNguonc
}

export const getDetailMovie = ({ slug }: { slug: string }) => {
  return queryOptions({
    queryKey: ['get-detail-movie-nguonc', slug],
    queryFn: async () => {
      const res = await request<Response>(nguonc, `api/film/${slug}`, 'GET')

      return {
        status: res?.status ?? 'undefined',
        movie: res ? mapToDetailMovie(res.movie, res.movie.episodes) : null
      }
    }
  })
}
