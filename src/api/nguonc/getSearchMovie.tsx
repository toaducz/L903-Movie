import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { Pagination } from '../pagination'
import { nguonc } from '@/utils/env'
import { mapPaginate, mapMovieItemToMovie } from '@/utils/mapping'

type MovieItems = {
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

type Paginate = {
  current_page: number
  total_page: number
  total_items: number
  items_per_page: number
}

type SearchMovieList = {
  status: string
  items: MovieItems[]
  paginate: Paginate
}

interface SearchMovieListRequest {
  page: number
  keyword: string
}

export const getSearchMovieListNguonc = ({ page = 1, keyword }: SearchMovieListRequest) => {
  return queryOptions({
    queryKey: ['get-search-movie-list-nguonc', page, keyword],
    queryFn: async () => {
      const res = await request<SearchMovieList>(nguonc, 'api/films/search', 'GET', { page: page, keyword: keyword })

      return {
        movies: res ? res.items.map(mapMovieItemToMovie) : [],
        pagination: res ? mapPaginate(res.paginate) : (null as Pagination | null)
      }
    }
  })
}
