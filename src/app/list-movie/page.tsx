// app/search/page.tsx
'use client'

import { Suspense } from 'react'
import { notFound, useSearchParams } from 'next/navigation'
import MovieListPage from '@/page/movie-list-page'

// Bọc phần tử cần sử dụng useSearchParams() bằng Suspense
export default function MoviePage() {
  return (
    <Suspense>
      <MovieListPageContent />
    </Suspense>
  )
}

function MovieListPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('typeList')?.trim()
  const pageParam = Number(searchParams.get('page') ?? '1')

  if (!query) {
    notFound()
  }

  console.log(query)

  return <MovieListPage typeList={query} page={pageParam} />
}
