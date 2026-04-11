'use client'

import { useEffect, useState } from 'react'
// import { getViewHistory } from '@/utils/local-storage'
import { Movie } from '@/api/kkphim/get-update-movie'
import MovieItem from '@/component/item/movie-item'

export default function RecommendationsSection() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoginRequired, setIsLoginRequired] = useState(false)

  // không login thì không cho xài, ko lấy từ localstorage luôn
  useEffect(() => {
    fetch('/api/history')
      .then(res => {
        if (res.status === 401) {
          setIsLoginRequired(true)
          return null
        }
        return res.json()
      })
      .then(async json => {
        if (!json) return

        let names: string[] = []
        if (json?.data?.length > 0) {
          names = json.data.slice(0, 15).map((d: { name: string }) => d.name)
        }
        if (names.length === 0) return

        setLoading(true)
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: names })
        })
        const data = await res.json()
        setMovies(data.movies ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (isLoginRequired) {
    return (
      <div className='px-2 sm:px-4 pt-6 pb-2'>
        <h2 className='text-white font-bold text-xl mb-4'>Gợi ý cho bạn</h2>
        <div className='text-white'>Vui lòng đăng nhập để sử dụng tính năng</div>
      </div>
    )
  }

  if (!loading && movies.length === 0) return null

  return (
    <div className='px-2 sm:px-4 pt-6 pb-2 w-full md:w-[90%] mx-auto'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-white font-bold text-xl mb-4 text-center sm:text-left'>Gợi ý cho bạn</h2>

        {loading ? (
          <div className='grid grid-cols-3 gap-4 sm:gap-6'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-[250px] sm:h-[360px] bg-gray-800 rounded-xl animate-pulse' />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-4 sm:gap-6'>
            {movies.map(movie => (
              <MovieItem key={movie._id ?? movie.slug} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
