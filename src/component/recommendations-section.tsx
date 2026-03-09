'use client'

import { useEffect, useState } from 'react'
import { getViewHistory } from '@/utils/local-storage'
import { Movie } from '@/api/kkphim/get-update-movie'
import MovieItem from '@/component/item/movie-item'

export default function RecommendationsSection() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.status === 401 ? null : res.json())
      .then(async json => {
        let names: string[] = []
        if (json?.data?.length > 0) {
          names = json.data.slice(0, 15).map((d: { name: string }) => d.name)
        } else {
          const local = getViewHistory()
          names = local.slice(0, 15).map(h => h.name)
        }
        if (names.length === 0) return

        setLoading(true)
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: names }),
        })
        const data = await res.json()
        setMovies(data.movies ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && movies.length === 0) return null

  return (
    <div className='px-2 sm:px-4 pt-6 pb-2'>
      <h2 className='text-white font-bold text-xl mb-4'>Gợi ý cho bạn</h2>
      {loading ? (
        <div className='flex gap-6'>
          {[1, 2, 3].map(i => (
            <div key={i} className='flex-1 h-[360px] bg-gray-800 rounded-xl animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-6'>
          {movies.map(movie => (
            <MovieItem key={movie._id ?? movie.slug} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
