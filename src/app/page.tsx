'use client'

import MovieItem from '@/component/item/movie-item'
import MovieRankItem from '@/component/item/movie-rank-item'
import { useQuery } from '@tanstack/react-query'
import { getLatestUpdateMovieList, Movie } from '@/api/kkphim/get-update-movie'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import { useRouter } from 'next/navigation'
import { getListMovie } from '@/api/kkphim/get-list-movie'

export default function Home() {
  const router = useRouter()
  const { data: updateMovie, isLoading, isError } = useQuery(getLatestUpdateMovieList({ page: 1 }))
  const {
    data: phimbo,
    isLoading: isLoadingPhimBo,
    isError: isErrorPhimBo
  } = useQuery(getListMovie({ typelist: 'phim-bo', page: 1, limit: 5 }))
  const {
    data: phimle,
    isLoading: isLoadingPhimLe,
    isError: isErrorPhimLe
  } = useQuery(getListMovie({ typelist: 'phim-le', page: 1, limit: 5 }))
  const {
    data: hoathinh,
    isLoading: isLoadingHoatHinh,
    isError: isErrorHoatHinh
  } = useQuery(getListMovie({ typelist: 'hoat-hinh', page: 1, limit: 5 }))
  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <Error />
  }

  return (
    <main className='min-h-screen p-2 sm:py-2 sm:px-4 bg-gray-900 text-gray-900'>
      <h1 className='text-2xl sm:text-4xl font-bold mb-8 text-center text-white pt-20 md:w-4/5'> Phim Mới Cập Nhật</h1>
      <div className='flex'>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:w-4/5 '>
          {updateMovie?.items.map(movie => (
            <MovieItem key={movie._id} movie={movie} />
          ))}
          <div className='py-2'>
            <button
              onClick={() => router.push('/all-movie')}
              className='text-white hover:text-blue-500 underline cursor-pointer'
            >{`Xem thêm`}</button>
          </div>
        </div>
        {/* cục này tạm tạm */}
        <div className='hidden md:block w-full max-w-[19rem]'>
          <h1 className='text-white font-bold text-center py-2'>Phim bộ mới cập nhật</h1>
          {renderMovieList(isLoadingPhimBo, isErrorPhimBo, phimbo?.data.items)}
          <div className='pb-2 px-5'>
            <button
              onClick={() => {
                router.push('/list-movie?typeList=phim-bo')
              }}
              className='text-white hover:text-blue-500 underline cursor-pointer'
            >{`Xem thêm`}</button>
          </div>

          <h1 className='text-white font-bold text-center py-2'>Phim lẻ mới cập nhật</h1>
          {renderMovieList(isLoadingPhimLe, isErrorPhimLe, phimle?.data.items)}
          <div className='pb-2 px-5'>
            <button
              onClick={() => {
                router.push('/list-movie?typeList=phim-le')
              }}
              className='text-white hover:text-blue-500 underline cursor-pointer'
            >{`Xem thêm`}</button>
          </div>

          <h1 className='text-white font-bold text-center py-2'>Hoạt hình mới cập nhật</h1>
          {renderMovieList(isLoadingHoatHinh, isErrorHoatHinh, hoathinh?.data.items)}
          <div className='pb-2 px-5'>
            <button
              onClick={() => {
                router.push('/list-movie?typeList=hoat-hinh')
              }}
              className='text-white hover:text-blue-500 underline cursor-pointer'
            >{`Xem thêm`}</button>
          </div>
        </div>
      </div>
    </main>
  )
}

function renderMovieList(isLoading: boolean, isError: boolean, items?: Movie[]) {
  if (isLoading) return <Loading />
  if (isError) return <Error />
  return items?.map((movie, index) => (
    <div className='flex pb-4' key={movie._id}>
      <MovieRankItem index={index} movie={movie} />
    </div>
  ))
}
