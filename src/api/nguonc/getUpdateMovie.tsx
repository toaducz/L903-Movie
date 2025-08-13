import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { Pagination } from '../pagination'
import { nguonc } from '@/utils/env'
import { mapPaginate, mapMovieItemToMovie } from '@/utils/mapping'

export type MovieItems = {
  id?: string
  name: string
  slug: string
  original_name: string
  thumb_url: string
  poster_url: string
  created: string // ISO datetime string
  modified: string // ISO datetime string
  description: string
  total_episodes: number
  current_episode: string
  time: string
  quality: string
  language: string
  director: string
  casts: string
}

export type Paginate = {
  current_page: number
  total_page: number
  total_items: number
  items_per_page: number
}

type LatestUpdateMovieList = {
  status: string
  items: MovieItems[]
  paginate: Paginate
}

interface LatestUpdateMovieListRequest {
  page: number
}

export const getLatestUpdateMovieList = ({ page }: LatestUpdateMovieListRequest) => {
  return queryOptions({
    queryKey: ['get-lasted-update-movie-list-nguonc', page],
    queryFn: async () => {
      const res = await request<LatestUpdateMovieList>(nguonc, 'api/films/phim-moi-cap-nhat', 'GET', { page })

      return {
        movies: res ? res.items.map(mapMovieItemToMovie) : [],
        pagination: res ? mapPaginate(res.paginate) : (null as Pagination | null)
      }
    }
  })
}
