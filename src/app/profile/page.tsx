'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../auth-provider'
import HistoryItem from '@/component/item/profile-movie-items'
import { getViewHistory } from '@/utils/local-storage'

type FavoriteMovie = {
  name: string
  image: string
  slug: string
  episode_name?: string
}

export default function ProfilePage() {
  const { logout, user } = useAuth()
  const [history, setHistory] = useState<FavoriteMovie[]>([])
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetch('/api/history')
        .then(res => res.json())
        .then(json => setHistory((json.data ?? []).slice(0, 5)))
    } else {
      setHistory(getViewHistory().slice(0, 5))
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    async function fetchFavorites() {
      try {
        const res = await fetch('/api/favorite?page=1&limit=5')
        const json = await res.json()
        if (json.data) {
          const mapped: FavoriteMovie[] = json.data.map((item: FavoriteMovie) => ({
            name: item.name,
            image: item.image,
            slug: item.slug
          }))
          setFavorites(mapped)
        }
      } catch (err) {
        console.error('Lỗi fetch favorites:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      fetchFavorites()
    }
  }, [user])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/review?my_reviews=1&limit=5')
        const json = await res.json()
        if (json.data) {
          setReviews(json.data)
        }
      } catch (err) {
        console.error('Lỗi fetch reviews:', err)
      }
    }
    if (user) {
      fetchReviews()
    }
  }, [user])

  return (
    <div className='pt-25 pb-20 px-4 max-w-4xl mx-auto bg-black text-white'>
      {user && <p className='mb-6'>Đăng nhập bằng: {user.email}</p>}
      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Phim đã xem gần đây</h2>
        {history.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
            {history.map(movie => (
              <HistoryItem key={movie.slug} slug={movie.slug} name={movie.name} image={movie.image} episodeName={movie.episode_name} />
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>Chưa có phim nào</p>
        )}
        <div className='mt-3'>
          <Link href='/profile/history' className='text-blue-600 hover:underline'>
            Xem thêm
          </Link>
        </div>
      </section>

      {/* Phim yêu thích */}
      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Phim yêu thích</h2>
        {loading ? (
          <p className='text-gray-500'>Đang tải...</p>
        ) : favorites.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
            {favorites.map(movie => (
              <HistoryItem key={movie.slug} slug={movie.slug} name={movie.name} image={movie.image} />
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>Bạn chưa có phim yêu thích nào.</p>
        )}
        <div className='mt-3'>
          <Link href='/profile/favorite' className='text-blue-600 hover:underline'>
            Xem thêm
          </Link>
        </div>
      </section>

      {/* Phim đã đánh giá */}
      {user && (
        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-3 border-l-4 border-yellow-500 pl-3'>Phim đã đánh giá</h2>
          {reviews.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
              {reviews.map(review => (
                <div key={review.id} className='relative transition-transform hover:scale-105'>
                   <HistoryItem slug={review.slug} name={review.name} image={review.image} />
                   <div className='absolute top-2 right-2 bg-black/80 text-yellow-500 text-sm font-bold px-3 py-1 rounded-full border border-yellow-500/50 shadow-lg flex items-center gap-1 backdrop-blur-md'>
                     <span>★</span> {review.score}
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-gray-500 bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center'>
              Bạn chưa tham gia đánh giá bộ phim nào.
            </div>
          )}
        </section>
      )}

      <div className='flex justify-center mt-6'>
        <button onClick={logout} className='px-4 py-2 bg-red-600 text-white rounded cursor-pointer hover:opacity-90'>
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
