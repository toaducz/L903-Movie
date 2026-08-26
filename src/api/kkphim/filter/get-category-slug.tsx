import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { kkphim } from '@/utils/env'

type CategorySlug = {
  _id: string
  name: string
  slug: string
}

type CategoryResponse = {
  data: {
    items: CategorySlug[]
  }
}

export const getCategorySlug = () => {
  return queryOptions({
    queryKey: ['get-category-slug'],
    queryFn: async () => {
      const res = await request<CategoryResponse | CategorySlug[]>(kkphim, 'the-loai', 'GET')
      if (Array.isArray(res)) return res
      return res?.data?.items ?? []
    }
  })
}
