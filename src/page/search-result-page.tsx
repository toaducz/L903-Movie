'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
// import { useMemo } from 'react'
import MovieItem from '@/component/item/movie-item'
import { getSearchByName } from '@/api/kkphim/search/getSearch'
import Pagination from '@/component/pagination'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import Image from 'next/image'
import errorImage from '@/assets/error.jpg'
import Link from 'next/link';

interface SearchProps {
  keyword: string
  page?: number
}

export default function SearchResultPage({ keyword, page }: Readonly<SearchProps>) {
  const router = useRouter()
  const [pageSearch, setPageSearch] = useState(page ?? 1)
  const { data: result, isLoading, isError } = useQuery(getSearchByName({ keyword: keyword, page: pageSearch }))

  // console.log(result?.data.items)

  const handlePageChange = (newPage: number) => {
    setPageSearch(newPage)
    router.push(`/search?q=${encodeURIComponent(keyword)}&page=${newPage}`)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pageSearch])

  // console.log(result?.data.params.pagination)

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <Error />
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900'>
      <div className='flex flex-col pt-20 items-center justify-content'>
        <h2 className='text-2xl font-semibold text-gray-100'>{result?.data.titlePage}</h2>
        <h6 className='font-semibold text-gray-100 mb-6 italic'>
          Có {result?.data.params.pagination.totalItems} kết quả
        </h6>
        {result?.data?.params?.pagination?.totalItems === 0 ? (
          <div>
            <Image
              unoptimized
              src={errorImage}
              alt='Loading...'
              width={200}
              height={200}
              className='object-contain'
              priority
            />
            <Link
              href={`/nguonc/search?q=${encodeURIComponent(keyword)}&page=1`}
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Không có kết quả? Thử với Nguonc.com nha
            </Link>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className='flex justify-center items-center '>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 sm:gap-5 gap-3 p-3 w-full'>
          {result?.data?.items?.map(movie => (
            <div key={movie._id}>
              <MovieItem movie={movie} />
            </div>
          ))}
        </div>
      </div>
      <Pagination
        currentPage={result?.data.params.pagination.currentPage ?? 1}
        totalPages={result?.data.params.pagination.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
