'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import MovieItem from '@/component/item/movie-item'
import Pagination from '@/component/pagination'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import Image from 'next/image'
import errorImage from '@/assets/error.jpg'
import { getLatestUpdateMovieList } from '@/api/nguonc/getUpdateMovie'
import { useEffect } from 'react'

// Force dynamic rendering to avoid static optimization issues
export const dynamic = 'force-dynamic'

function MovieListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const { data: listMovie, isLoading, isError } = useQuery(getLatestUpdateMovieList({ page }))

  const handlePageChange = (newPage: number) => {
    router.push(`/nguonc/home?page=${newPage}`)
  }

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  if (isLoading) return <Loading />
  if (isError) return <Error />

  return (
    <>
      {listMovie?.movies.length === 0 ? (
        <div className='flex flex-col items-center'>
          <Image
            unoptimized
            src={errorImage}
            alt='Không có phim'
            width={200}
            height={200}
            className='object-contain'
            priority
          />
          <p className='text-gray-100 mt-4'>Không tìm thấy phim nào!</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 poderes lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-5 p-3 w-full px-24'>
          {listMovie?.movies.map(movie => (
            <div key={movie.slug}>
              <MovieItem movie={movie} color={'bg-slate-900'} source='nguonc' />
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={listMovie?.pagination?.currentPage ?? 1}
        totalPages={listMovie?.pagination?.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </>
  )
}

export default function MovieListPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-slate-800'>
      <div className='flex flex-col pt-20 items-center'>
        <h2 className='text-2xl font-semibold text-blue-400'>Nguonc.com</h2>
        <h6 className='font-semibold text-gray-100 mb-6 italic'>Chả biết ghi gì nên để tạm, chắc thanh search ở đây</h6>
        <Suspense fallback={<Loading />}>
          <MovieListContent />
        </Suspense>
      </div>
    </div>
  )
}