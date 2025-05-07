'use client'

import MovieItem from '@/component/item/movie-item'
import MovieRankItem from '@/component/item/movie-rank-item'
import { useQuery } from '@tanstack/react-query'
import { getLatestUpdateMovieList } from '@/api/getUpdatedMovie'

export default function Home() {
  const { data: updateMovie } = useQuery(getLatestUpdateMovieList({ page: 1 }))


  return (
    <main className="min-h-screen p-2 sm:py-2 sm:px-4 bg-gray-900 text-gray-900">
      <h1 className="text-2xl sm:text-4xl font-bold mb-8 text-center text-white pt-15 md:w-4/5"> Phim Mới Cập Nhật</h1>
      <div className='flex'>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:w-4/5 ">
          {updateMovie?.items.map((movie) => (
            <MovieItem key={movie._id} movie={movie} />
          ))}
          <div className='py-2'>
            <button className='text-white hover:text-blue-500 underline cursor-pointer'>{`Xem thêm`}</button>
          </div>
        </div>
        {/* cục này tạm tạm */}
        <div className='w-1/5 hidden md:block'>
          <h1 className='text-white font-bold text-center py-2'>Phim bộ mới cập nhật</h1>
          {updateMovie?.items.slice(0, 5).map((movie, index) => (
            <div className='flex pb-4' key={movie._id}>
              <MovieRankItem index={index} movie={movie} />
            </div>
          ))}
          <div className='pb-2 px-5'>
            <button className='text-white hover:text-blue-500 underline cursor-pointer'>{`Xem thêm`}</button>
          </div>

          <h1 className='text-white font-bold text-center py-2'>Phim lẻ mới cập nhật</h1>
          {updateMovie?.items.slice(6, 11).map((movie, index) => (
            <div className='flex pb-4' key={movie._id}>
              <MovieRankItem index={index} movie={movie} />
            </div>
          ))}
          <div className='pb-2 px-5'>
            <button className='text-white hover:text-blue-500 underline cursor-pointer'>{`Xem thêm`}</button>
          </div>

          <h1 className='text-white font-bold text-center py-2'>Hoạt hình mới cập nhật</h1>
          {updateMovie?.items.slice(12, 16).map((movie, index) => (
            <div className='flex pb-4' key={movie._id}>
              <MovieRankItem index={index} movie={movie} />
            </div>
          ))}
          <div className='pb-2 px-5'>
            <button className='text-white hover:text-blue-500 underline cursor-pointer'>{`Xem thêm`}</button>
          </div>
        </div>
      </div>
    </main>
  )
}
