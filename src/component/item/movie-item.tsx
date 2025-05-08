'use client'

import Image from 'next/image'
import { Movie } from '@/api/getUpdatedMovie'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  movie: Movie
}

export default function MovieItem({ movie }: Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const handleClick = () => {
    router.push(`/detail-movie/${movie.slug}`)
  }
  const normalizePosterUrl = (posterUrl: string) => {
    if (!posterUrl.startsWith('http')) {
      return `https://phimimg.com/${posterUrl.replace(/^\/+/, '')}`
    }
    return posterUrl
  }

  const poster = normalizePosterUrl(movie.poster_url)
  return (
    <div
      onClick={handleClick}
      className='bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden hover:opacity-80 cursor-pointer'
    >
      <Image
        unoptimized
        priority // Thêm dòng này
        src={poster}
        alt={movie.name}
        width={270}
        height={300}
        onLoad={() => setIsLoaded(false)}
        className={`w-full object-cover h-[270px] ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />

      <div className='p-4'>
        <h2 className='text-md font-semibold text-white h-13 line-clamp-2 overflow-hidden'>{movie.name}</h2>
        <p className='text-sm text-gray-500 italic line-clamp-1 '>{movie.origin_name}</p>
        <div className='text-sm text-gray-600 mt-2'>
          <span>{movie.year}</span> · <span>{movie.quality}</span>
        </div>

        <div className='text-xs text-gray-500 mt-2 line-clamp-2 h-12'>
          {movie.category.map(cat => cat.name).join(', ')}
        </div>
      </div>
    </div>
  )
}
