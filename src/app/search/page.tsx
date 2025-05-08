// app/search/page.tsx
'use client'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import SearchResultPage from '@/page/search-result-page'

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
  const query = searchParams?.get('q')?.trim()
  const pageParam = Number(searchParams.get('page') || '1')

  if (!query) {
    notFound()
  }

  return <SearchResultPage keyword={query} page={pageParam} />
}
