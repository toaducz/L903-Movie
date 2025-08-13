'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Movie } from '@/api/kkphim/getUpdatedMovie'
import React, { useState } from 'react'
import ouguricap from '@/assets/xin-loi-ouguri-cap-cua-toi-an-het-anh-roi.jpg'

type Props = {
  movie: Movie
  color?: string
  source?: string
}

export default function MovieItem({ movie, color }: Readonly<Props>) {
  const [isLoaded, setIsLoaded] = useState(false)

  const normalizePosterUrl = (posterUrl: string | object | null | undefined) => {
  if (!posterUrl) return ouguricap; // null, undefined, empty
  if (typeof posterUrl === 'object') return ouguricap; // object trả về ouguricap

  const temp = String(posterUrl).trim();
  if (temp === '{}' || temp === '') return ouguricap; // object stringify hoặc empty string

  if (!temp.startsWith('http')) {
    return `https://phimimg.com/${temp.replace(/^\/+/, '')}`;
  }
  return temp;
};


  const poster = normalizePosterUrl(movie.poster_url)

  return (
    <Link
      href={`detail-movie/${movie.slug}`}
      className={`block ${color ?? 'bg-slate-800'} rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden hover:opacity-80 cursor-pointer`}
    >
      <Image
        unoptimized
        priority
        src={poster ?? ""}
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
          {movie.category?.map(cat => cat.name).join(', ')}
        </div>
      </div>
    </Link>
  )
}
