import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { kkphim } from '@/utils/env'

type CountrySlug = {
  _id: string
  name: string
  slug: string
}

type CountryResponse = {
  data: {
    items: CountrySlug[]
  }
}

export const getCountrySlug = () => {
  return queryOptions({
    queryKey: ['get-country-slug'],
    queryFn: async () => {
      const res = await request<CountryResponse | CountrySlug[]>(kkphim, 'quoc-gia', 'GET')
      if (Array.isArray(res)) return res
      return res?.data?.items ?? []
    }
  })
}
