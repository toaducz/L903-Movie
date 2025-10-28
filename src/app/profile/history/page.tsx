'use client'

import { useEffect, useState, useCallback } from 'react'
import HistoryItem from '@/component/item/profile-movie-items'
import { getViewHistory } from '@/utils/local-storage'

export default function FavoritePage() {
  const [allMovies, setAllMovies] = useState<{ name: string; slug: string; image: string }[]>([])
  const [visibleMovies, setVisibleMovies] = useState<typeof allMovies>([])
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const history = getViewHistory()
    setAllMovies(history)
    setVisibleMovies(history.slice(0, PAGE_SIZE))
  }, [])

  // fake infinite scrolling cho ngầu
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
      visibleMovies.length < allMovies.length
    ) {
      setPage(prev => prev + 1)
    }
  }, [visibleMovies, allMovies])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setVisibleMovies(allMovies.slice(0, page * PAGE_SIZE))
  }, [page, allMovies])

  const clearHistory = () => {
    localStorage.removeItem('viewHistory') // xóa localstorage
    setAllMovies([])
    setVisibleMovies([])
  }

  return (
    <div className='pt-25 px-4 max-w-5xl mx-auto min-h-screen'>
      <h1 className='text-2xl font-bold mb-6'>Lịch sử xem</h1>

      {visibleMovies.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 min-h-screen'>
          {visibleMovies.map(movie => (
            <HistoryItem key={movie.slug} slug={movie.slug} name={movie.name} image={movie.image} />
          ))}
        </div>
      ) : (
        <p className='text-gray-500 min-h-screen'>Bạn chưa xem phim nào.</p>
      )}

      {visibleMovies.length < allMovies.length && <p className='text-center mt-4 text-gray-400'>Đang tải thêm...</p>}

      {visibleMovies.length > 0 && (<div className='mt-6 text-center'>
        <button onClick={clearHistory} className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition mb-10 cursor-pointer'>
          Xóa hết lịch sử xem
        </button>
      </div>)}
    </div>
  )
}
