import { Pagination } from '@/api/pagination'
import { Movie } from '../getUpdatedMovie'
import { request } from '@/utils/request'
import { queryOptions } from '@tanstack/react-query'
import { kkphim } from '@/utils/env'

type Param = {
  type_slug: string
  keyword: string
  filterCategory: string[]
  filterCountry: string[]
  filterYear: string[]
  filterType: string[]
  sortField: string
  sortType: string
  pagination: Pagination
}

type SeoOnPage = {
  og_type: string
  titleHead: string
  descriptionHead: string
  og_image: string[]
  og_url: string
}

type BreadCrumbItem = {
  name: string
  isCurrent: boolean
  position: number
}

// type BreadCrumb = BreadCrumbItem[];

export type SearchResult = {
  seoOnPage: SeoOnPage
  breadCrumb: BreadCrumbItem[]
  titlePage: string
  items: Movie[]
  params: Param
  type_list: string
  APP_DOMAIN_FRONTEND: string
  APP_DOMAIN_CDN_IMAGE: string
}

type SearchByNameRequest = {
  keyword: string
  page: number
}

type SearchResponse = {
  data: SearchResult
  msg: string
  status: string
}

export const getSearchByName = ({ keyword, page = 1 }: SearchByNameRequest) => {
  return queryOptions({
    queryKey: ['get-search-by-name', keyword, page],
    queryFn: () =>
      request<SearchResponse>(kkphim, `v1/api/tim-kiem`, 'GET', {
        keyword: keyword,
        page: page
      })
  })
}
