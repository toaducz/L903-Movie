'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
// import { useMemo } from 'react'
import MovieItem from '@/component/item/movie-item'
import { getListMovie } from '@/api/kkphim/getListMovie'
import Pagination from '@/component/pagination'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import Image from 'next/image'
import errorImage from '@/assets/error.jpg'

interface MovieListProps {
  typeList: string
  page?: number
  sort_field?: string
  sort_type?: string
  sort_lang?: string
  category?: string
  country?: string
  year?: string
  limit?: number
}

export default function MovieListPage({
  typeList,
  page,
  sort_field,
  sort_type,
  sort_lang,
  category,
  country,
  year,
  limit
}: Readonly<MovieListProps>) {
  const router = useRouter()
  const [pageSearch, setPageSearch] = useState(page ?? 1)
  const {
    data: listMovie,
    isLoading,
    isError
  } = useQuery(
    getListMovie({
      typeList: typeList,
      page: pageSearch,
      sort_field,
      sort_type,
      sort_lang,
      category,
      country,
      year,
      limit
    })
  )

  //   console.log(listMovie?.data.items)

  const handlePageChange = (newPage: number) => {
    setPageSearch(newPage)
    router.push(`/list-movie?typeList=${encodeURIComponent(typeList)}&page=${newPage}`)
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
        <h2 className='text-2xl font-semibold text-gray-100'>{listMovie?.data.titlePage}</h2>
        <h6 className='font-semibold text-gray-100 mb-6 italic'>{listMovie?.data.seoOnPage.descriptionHead}</h6>
        {listMovie?.data.items.length === 0 ? (
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
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className='flex justify-center items-center '>
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 sm:gap-5 gap-3 p-3 w-full'>
          {listMovie?.data?.items.map(movie => (
            <div key={movie._id}>
              <MovieItem movie={movie} />
            </div>
          ))}
        </div>
      </div>
      <Pagination
        currentPage={listMovie?.data.params.pagination.currentPage ?? 1}
        totalPages={listMovie?.data.params.pagination.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
