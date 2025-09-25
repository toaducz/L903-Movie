'use client'

import { Suspense, useState, useEffect } from 'react'
import { notFound, useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getListMovieByCountry } from '@/api/kkphim/list-movie/get-list-movie-by-country'
import MovieListPage from '@/page/movie-list-page'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import MovieFilter from '@/component/filter/movie-filter'

export default function MovieByCountryPage() {
  return (
    <Suspense>
      <MovieListPageContent />
    </Suspense>
  )
}

function MovieListPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageParam = Number(searchParams.get('page') ?? '1')
  const countryParam = searchParams?.get('country')?.trim()
  if (!countryParam) notFound()

  const [pageSearch, setPageSearch] = useState(pageParam)
  const [filterDraft, setFilterDraft] = useState({
    year: searchParams.get('year') ?? '',
    category: searchParams.get('category') ?? '',
    sortField: searchParams.get('sort_field') ?? '',
    sortType: searchParams.get('sort_type') ?? ''
  })

  const [filter, setFilter] = useState(filterDraft)

  const {
    data: listMovie,
    isLoading,
    isError
  } = useQuery(
    getListMovieByCountry({
      country: countryParam!,
      page: pageSearch,
      sort_field: filter.sortField || undefined,
      sort_type: filter.sortType || undefined,
      category: filter.category || undefined,
      year: filter.year || undefined
    })
  )

  const handlePageChange = (newPage: number) => {
    setPageSearch(newPage)
    pushFilterParams(newPage, filter)
  }

  const handleFilter = () => {
    setPageSearch(1)
    setFilter(filterDraft) // sync filter thật với filterDraft
    pushFilterParams(1, filterDraft)
  }

  const handleReset = () => {
    const resetFilter = {
      year: '',
      category: '',
      sortField: '',
      sortType: ''
    }
    setFilterDraft(resetFilter)
    setFilter(resetFilter)
    setPageSearch(1)
    router.push(`/list-movie/country?country=${countryParam}&page=1`)
  }

  const pushFilterParams = (page: number, f: typeof filter) => {
    const params = new URLSearchParams({
      country: countryParam!,
      page: String(page)
    })
    if (f.year) params.set('year', f.year)
    if (f.category) params.set('category', f.category)
    if (f.sortField) params.set('sort_field', f.sortField)
    if (f.sortType) params.set('sort_type', f.sortType)

    router.replace(`/list-movie/country?${params.toString()}`)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pageSearch])

  if (isLoading) return <Loading />
  if (isError) return <Error />

  return (
    <div className='space-y-4'>
      <MovieFilter
        country={countryParam}
        year={filterDraft.year}
        category={filterDraft.category}
        sortField={filterDraft.sortField}
        sortType={filterDraft.sortType}
        onChange={draft => {
          setFilterDraft(draft)
          // Nếu country đổi thì push ngay (case đặc biệt)
          if (draft.country && draft.country !== countryParam) {
            router.push(`/list-movie/country?country=${draft.country}&page=1`)
          }
        }}
        onSubmit={handleFilter}
        onReset={handleReset}
        type='country'
      />
      <MovieListPage listMovie={listMovie} country={countryParam} onPageChange={handlePageChange} headTitle={true} />
    </div>
  )
}
