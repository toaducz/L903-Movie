// import { Pagination } from './pagination'
import { queryOptions } from '@tanstack/react-query'
import { request } from '@/utils/request'
import { kkphim } from '@/utils/env'

type CountrySlug = {
  _id: string
  name: string
  slug: string
}

export const getCountrySlug = () => {
  return queryOptions({
    queryKey: ['get-country-slug'],
    queryFn: () => request<CountrySlug[]>(kkphim, `/quoc-gia`, 'GET')
  })
}
