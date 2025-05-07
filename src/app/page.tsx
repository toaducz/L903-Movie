'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { getLatestUpdateMovieList } from '@/api/getUpdatedMovie'

export default function Home() {
  const { data: updateMovie } = useQuery(getLatestUpdateMovieList({ page: 1 }))

  return (
    <main className="min-h-screen p-6 sm:p-12 bg-gray-900 text-gray-900">
      <h1 className="text-2xl sm:text-4xl font-bold mb-8 text-center text-white"> Phim Mới Cập Nhật</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {updateMovie?.items.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
          >
            <Image
              unoptimized
              src={movie.poster_url}
              alt={movie.name}
              width={200}
              height={300}
              className="w-full object-cover"
              style={{ maxHeight: '300px' }}
            />

            <div className="p-4">
              <h2 className="text-md font-semibold truncate text-white">{movie.name}</h2>
              <p className="text-sm text-gray-500 italic">{movie.origin_name}</p>
              <div className="text-sm text-gray-600 mt-2">
                <span>{movie.year}</span> · <span>{movie.quality}</span>
              </div>

              <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                {movie.category.map((cat) => cat.name).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
