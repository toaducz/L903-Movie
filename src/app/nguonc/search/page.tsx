// app/search/page.tsx
'use client'

import { Suspense } from 'react'
import { notFound, useSearchParams } from 'next/navigation'
import SearchResultPageNguonc from '@/page/nguonc/search/search-result-page-nguonc'

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
  const pageParam = Number(searchParams.get('page') ?? '1')

  if (!query) {
    notFound()
  }

  return <SearchResultPageNguonc keyword={query} page={pageParam} />
}
