'use client'

import { useEffect, useState } from 'react'
import HistoryItem from '@/component/item/profile-movie-items'

type FavoriteMovie = {
  name: string
  slug: string
  image: string
}

export default function FavoritePage() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchFavorites() {
    try {
      setLoading(true)
      const res = await fetch('/api/favorite?page=1&limit=20')
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        const mapped: FavoriteMovie[] = json.data.map((item: FavoriteMovie) => ({
          name: item.name,
          slug: item.slug,
          image: item.image
        }))
        setFavorites(mapped)
      }
    } catch (e) {
      setError('Không thể tải danh sách phim yêu thích: ' + e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
      const result = await res.json()
      if (!result.error) {
        fetchFavorites()
        window.location.reload()
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error('Xóa thất bại:', err)
    }
  }

  return (
    <div className='pt-25 px-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Phim yêu thích</h1>

      {loading && <p className='text-gray-500'>Đang tải...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {!loading && !error && favorites.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
          {favorites.map(movie => (
            <div key={movie.slug} className='relative'>
              <HistoryItem slug={movie.slug} name={movie.name} image={movie.image} />
              <button
                onClick={() => handleDelete(movie.slug)}
                className='absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
                           bg-red-600 text-white text-sm rounded hover:bg-red-700 transition cursor-pointer'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && favorites.length === 0 && <p className='text-gray-500'>Bạn chưa có phim yêu thích nào.</p>}
    </div>
  )
}
