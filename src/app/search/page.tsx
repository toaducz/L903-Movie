'use client'

import { Suspense, useState, useEffect } from 'react'
import { notFound, useSearchParams, useRouter } from 'next/navigation'
import SearchResultPage from '@/page/search-result-page'
import MovieFilter from '@/component/filter/movie-filter'

// Bọc phần tử cần sử dụng useSearchParams() bằng Suspense
export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams?.get('q')?.trim() ?? ''
  const pageParam = Number(searchParams.get('page') ?? '1')

  const [filterDraft, setFilterDraft] = useState({
    year: searchParams.get('year') ?? '',
    country: searchParams.get('country') ?? '',
    category: searchParams.get('category') ?? '',
    sortField: searchParams.get('sort_field') ?? '',
    sortType: searchParams.get('sort_type') ?? ''
  })

  // Khi URL thay đổi, đồng bộ lại filterDraft (ví dụ khi user bấm quay lại)
  useEffect(() => {
    setFilterDraft({
      year: searchParams.get('year') ?? '',
      country: searchParams.get('country') ?? '',
      category: searchParams.get('category') ?? '',
      sortField: searchParams.get('sort_field') ?? '',
      sortType: searchParams.get('sort_type') ?? ''
    })
  }, [searchParams])

  if (!query) {
    notFound()
  }

  const handleFilter = () => {
    pushParams(1, filterDraft)
  }

  const handleReset = () => {
    const resetFilter = {
      year: '',
      country: '',
      category: '',
      sortField: '',
      sortType: ''
    }
    setFilterDraft(resetFilter)
    router.replace(`/search?q=${encodeURIComponent(query)}&page=1`)
  }

  const pushParams = (page: number, f: typeof filterDraft) => {
    const params = new URLSearchParams({
      q: query,
      page: String(page)
    })
    if (f.country) params.set('country', f.country)
    if (f.year) params.set('year', f.year)
    if (f.category) params.set('category', f.category)
    if (f.sortField) params.set('sort_field', f.sortField)
    if (f.sortType) params.set('sort_type', f.sortType)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className='bg-slate-900'>
      <MovieFilter
        country={filterDraft.country}
        year={filterDraft.year}
        category={filterDraft.category}
        sortField={filterDraft.sortField}
        sortType={filterDraft.sortType}
        onChange={setFilterDraft}
        onSubmit={handleFilter}
        onReset={handleReset}
      />
      <SearchResultPage
        keyword={query}
        page={pageParam}
        category={searchParams.get('category') ?? undefined}
        country={searchParams.get('country') ?? undefined}
        year={searchParams.get('year') ?? undefined}
        sort_field={searchParams.get('sort_field') ?? undefined}
        sort_type={searchParams.get('sort_type') ?? undefined}
        headTitle={true}
      />
    </div>
  )
}
