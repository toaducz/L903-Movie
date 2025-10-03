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
}

export default function ProfilePage() {
  const { logout, user } = useAuth()
  const [history, setHistory] = useState<FavoriteMovie[]>([])
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setHistory(getViewHistory().slice(0, 5))
  }, [])

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

  return (
    <div className='pt-25 pb-20 px-4 max-w-4xl mx-auto bg-black'>
      {user && <p className='mb-6'>Đăng nhập bằng: {user.email}</p>}
      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Phim đã xem gần đây</h2>
        {history.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
            {history.map(movie => (
              <HistoryItem key={movie.slug} slug={movie.slug} name={movie.name} image={movie.image} />
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

      <div className='flex justify-center mt-6'>
        <button onClick={logout} className='px-4 py-2 bg-red-600 text-white rounded cursor-pointer hover:opacity-90'>
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
