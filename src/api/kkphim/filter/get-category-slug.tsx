// import { Pagination } from './pagination'
import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { kkphim } from '@/utils/env'

type CategorySlug = {
  _id: string
  name: string
  slug: string
}

export const getCategorySlug = () => {
  return queryOptions({
    queryKey: ['get-category-slug'],
    queryFn: () => request<CategorySlug[]>(kkphim, `/the-loai`, 'GET')
  })
}
