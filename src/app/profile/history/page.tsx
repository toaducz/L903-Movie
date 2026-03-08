'use client'

import { useEffect, useState } from 'react'
import HistoryItem from '@/component/item/profile-movie-items'
import { getViewHistory } from '@/utils/local-storage'
import { useAuth } from '@/app/auth-provider'

type HistoryMovie = { name: string; slug: string; image: string; episode_name?: string }

export default function HistoryPage() {
  const { user } = useAuth()
  const [allMovies, setAllMovies] = useState<HistoryMovie[]>([])
  const [visibleMovies, setVisibleMovies] = useState<HistoryMovie[]>([])
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    if (user) {
      fetch('/api/history')
        .then(res => res.json())
        .then(json => {
          const items: HistoryMovie[] = (json.data ?? []).map((d: { name: string; slug: string; image: string; episode_name?: string }) => ({
            name: d.name,
            slug: d.slug,
            image: d.image,
            episode_name: d.episode_name
          }))
          setAllMovies(items)
          setVisibleMovies(items.slice(0, PAGE_SIZE))
        })
    } else {
      const history = getViewHistory()
      setAllMovies(history)
      setVisibleMovies(history.slice(0, PAGE_SIZE))
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        visibleMovies.length < allMovies.length
      ) {
        setPage(prev => prev + 1)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visibleMovies, allMovies])

  useEffect(() => {
    setVisibleMovies(allMovies.slice(0, page * PAGE_SIZE))
  }, [page, allMovies])

  const clearHistory = async () => {
    if (user) {
      await fetch('/api/history', { method: 'DELETE' })
    } else {
      localStorage.removeItem('viewHistory')
    }
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

      {visibleMovies.length > 0 && (
        <div className='mt-6 text-center'>
          <button onClick={clearHistory} className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition mb-10 cursor-pointer'>
            Xóa hết lịch sử xem
          </button>
        </div>
      )}
    </div>
  )
}
