// app/search/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AllMoviePage from '@/page/all-movie-page'

// Bọc phần tử cần sử dụng useSearchParams() bằng Suspense
export default function MoviePage() {
  return (
    <Suspense>
      <AllMovieListPageContent />
    </Suspense>
  )
}

function AllMovieListPageContent() {
  const searchParams = useSearchParams()

  const pageParam = Number(searchParams.get('page') ?? '1')

  return <AllMoviePage page={pageParam} />
}
