'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Movie } from '@/api/kkphim/get-update-movie'
import React, { useState } from 'react'
import ouguricap from '@/assets/xin-loi-ouguri-cap-cua-toi-an-het-anh-roi.jpg'
import ouguricapLoading from '@/assets/xin-loi-ouguri-cap-cua-toi-an-het-anh-roi.png'

type Props = {
  movie: Movie
  color?: string
  source?: string
}

export default function MovieItem({ movie, color, source }: Readonly<Props>) {
  const [isLoaded, setIsLoaded] = useState(false)

  const normalizePosterUrl = (posterUrl: string | object | null | undefined) => {
    if (!posterUrl) return ouguricapLoading // null, undefined, empty
    if (typeof posterUrl === 'object') return ouguricapLoading // object trả về ouguricap

    const temp = String(posterUrl).trim()
    if (temp === '{}' || temp === '') return ouguricapLoading // object stringify hoặc empty string

    if (!temp.startsWith('http')) {
      return `https://phimimg.com/${temp.replace(/^\/+/, '')}`
    }
    return temp
  }

  const poster = normalizePosterUrl(movie.poster_url)

  return (
    <Link
      href={source ? `/${source}/detail-movie/${movie.slug}` : `/detail-movie/${movie.slug}`}
      className={`block ${color ?? 'bg-slate-800'} rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden hover:opacity-80 cursor-pointer`}
    >
      <div className='relative w-[auto] h-[300px]'>
        {!isLoaded && <div className='absolute inset-0 bg-gray-700 animate-pulse rounded-lg' />}
        <Image
          unoptimized
          priority
          src={poster ?? ouguricap}
          alt={movie.name}
          width={270}
          height={300}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className='p-4'>
        <h2 className='text-md font-semibold text-white h-13 line-clamp-2 overflow-hidden'>{movie.name}</h2>
        <p className='text-sm text-gray-500 italic line-clamp-1 '>{movie.origin_name}</p>
        <div className='text-sm text-gray-600 mt-2'>
          <span>{movie.year}</span> · <span>{movie.quality}</span>
        </div>

        <div className='text-xs text-gray-500 mt-2 line-clamp-2 h-12'>
          {movie.category?.map(cat => cat.name).join(', ')}
        </div>
      </div>
    </Link>
  )
}
