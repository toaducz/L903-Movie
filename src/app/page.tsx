'use client'

import { useState } from 'react'
import MovieItem from '@/component/item/movie-item'
import MovieRankItem from '@/component/item/movie-rank-item'
import { useQuery } from '@tanstack/react-query'
import { getLatestUpdateMovieList, Movie } from '@/api/kkphim/get-update-movie'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import { useRouter } from 'next/navigation'
import { getListMovie } from '@/api/kkphim/get-list-movie'
import ContinueWatchingSection from '@/component/sections/continue-watching-section'
import RecommendationsSection from '@/component/sections/recommendations-section'

export default function Home() {
  const router = useRouter()
  const [showRecommendations, setShowRecommendations] = useState(false)

  // API Calls
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

  if (isLoading) return <Loading />
  if (isError) return <Error />

  return (
    <main className='min-h-screen bg-gray-900 text-white pb-10'>
      {/* Top Sections: Full Width Container */}
      <div className='max-w-[1800px] mx-auto px-4 pt-20'>
        <ContinueWatchingSection />

        <div className='py-6 flex justify-center'>
          {!showRecommendations ? (
            <button
              onClick={() => setShowRecommendations(true)}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg shadow-md transition-all cursor-pointer'
            >
              Xem gì hôm nay?
            </button>
          ) : (
            <div className='w-full'>
              <RecommendationsSection />
              <div className='flex justify-center mt-6'>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className='px-6 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg shadow-md transition-all cursor-pointer'
                >
                  Đóng gợi ý
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className='max-w-[1800px] mx-auto px-4 flex flex-col md:flex-row gap-8'>
        {/* LEFT COLUMN: Movie Grid (Phần chính) */}
        <div className='flex-1'>
          <h1 className='text-2xl sm:text-4xl font-bold mb-8 text-left border-l-4 border-blue-600 pl-4'>
            Phim Mới Cập Nhật
          </h1>

          {/* Grid đã fix: Tự động nhảy cột dựa trên không gian thực tế */}
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
            {updateMovie?.items.map(movie => (
              <MovieItem key={movie._id} movie={movie} />
            ))}
          </div>

          <div className='mt-10 flex justify-center md:justify-start'>
            <button
              onClick={() => router.push('/all-movie')}
              className='text-gray-400 hover:text-blue-500 underline transition-colors cursor-pointer'
            >
              Xem thêm tất cả phim mới
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Phim bộ, lẻ, hoạt hình) */}
        <aside className='hidden md:block w-full md:w-[19rem] shrink-0 space-y-10'>
          {/* Section Phim Bộ */}
          <div>
            <h2 className='text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-blue-400'>Phim bộ mới</h2>
            {renderMovieList(isLoadingPhimBo, isErrorPhimBo, phimbo?.data.items)}
            <button
              onClick={() => router.push('/list-movie?typelist=phim-bo')}
              className='mt-2 text-sm text-gray-400 hover:text-blue-400 underline'
            >
              Xem tất cả phim bộ
            </button>
          </div>

          {/* Section Phim Lẻ */}
          <div>
            <h2 className='text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-red-400'>Phim lẻ mới</h2>
            {renderMovieList(isLoadingPhimLe, isErrorPhimLe, phimle?.data.items)}
            <button
              onClick={() => router.push('/list-movie?typelist=phim-le')}
              className='mt-2 text-sm text-gray-400 hover:text-blue-400 underline'
            >
              Xem tất cả phim lẻ
            </button>
          </div>

          {/* Section Hoạt Hình */}
          <div>
            <h2 className='text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-green-400'>Hoạt hình mới</h2>
            {renderMovieList(isLoadingHoatHinh, isErrorHoatHinh, hoathinh?.data.items)}
            <button
              onClick={() => router.push('/list-movie?typelist=hoat-hinh')}
              className='mt-2 text-sm text-gray-400 hover:text-blue-400 underline'
            >
              Xem tất cả hoạt hình
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

// Helper function giữ nguyên nhưng bọc div gọn hơn
function renderMovieList(isLoading: boolean, isError: boolean, items?: Movie[]) {
  if (isLoading) return <div className='animate-pulse text-gray-500'>Đang tải...</div>
  if (isError) return <div className='text-red-500 text-sm'>Lỗi tải dữ liệu.</div>
  return (
    <div className='flex flex-col gap-4'>
      {items?.map((movie, index) => (
        <MovieRankItem key={movie._id} index={index} movie={movie} />
      ))}
    </div>
  )
}
