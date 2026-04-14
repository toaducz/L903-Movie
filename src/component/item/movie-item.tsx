'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Movie } from '@/api/kkphim/get-update-movie'
import React, { useState } from 'react'

type Props = {
  movie: Movie
  color?: string
  source?: string
}

export default function MovieItem({ movie, color, source }: Readonly<Props>) {
  const [isLoaded, setIsLoaded] = useState(false)

  const normalizePosterUrl = (posterUrl: string | object | null | undefined) => {
    if (!posterUrl) return null
    if (typeof posterUrl === 'object') return null

    const temp = String(posterUrl).trim()
    if (temp === '{}' || temp === '') return null

    if (!temp.startsWith('http')) {
      return `https://phimimg.com/${temp.replace(/^\/+/, '')}`
    }
    return temp
  }

  const poster = normalizePosterUrl(movie.poster_url)
  const thumb = normalizePosterUrl(movie.thumb_url)

  // Use wsrv.nl for high-quality resizing and consistent sizes
  const optimizedUrl = (url: string | null) => {
    if (!url) return ''
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=300&h=450&fit=cover&output=webp&q=80`
  }

  return (
    <Link
      href={source ? `/${source}/detail-movie/${movie.slug}` : `/detail-movie/${movie.slug}`}
      className={`group block relative rounded-xl overflow-hidden transition-all duration-500 ${
        color ?? 'bg-slate-900/40'
      } border border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1`}
    >
      {/* Poster Container */}
      <div className='relative aspect-[2/3] overflow-hidden bg-slate-800'>
        {!isLoaded && <div className='absolute inset-0 bg-slate-800 animate-pulse' />}
        <Image
          src={optimizedUrl(poster ?? thumb) || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={movie.name}
          fill
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw'
          loading='lazy'
          onLoad={() => setIsLoaded(true)}
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          unoptimized
        />

        {/* Hover Overlay - More subtle */}
        <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
          <div className='w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-300'>
            <svg
              className='w-5 h-5 text-white ml-0.5'
              viewBox='0 0 24 24'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M8 5.14v14c0 .86.84 1.4 1.58.97l11-7a1.12 1.12 0 0 0 0-1.94l-11-7a1.13 1.13 0 0 0-1.58 1z' />
            </svg>
          </div>
        </div>

        {/* Badges with requested colors */}
        <div className='absolute top-2 left-2 flex flex-col gap-1'>
          {movie.quality && (
            <span className='px-1.5 py-0.5 bg-blue-600/90 text-white text-[9px] font-bold tracking-wider rounded backdrop-blur-md border border-white/10 uppercase'>
              {movie.quality}
            </span>
          )}
        </div>

        <div className='absolute top-2 right-2'>
          {movie.episode_current && movie.episode_current !== 'Full' && (
            <span className='px-1.5 py-0.5 bg-yellow-500/90 text-black text-[9px] font-bold rounded backdrop-blur-md border border-yellow-400/20'>
              {movie.episode_current}
            </span>
          )}
        </div>

        {/* Bottom Badge - Lang */}
        {movie.lang && (
          <div className='absolute bottom-2 left-2'>
            <span className='px-1.5 py-0.5 bg-black/40 text-white/70 text-[9px] rounded-sm backdrop-blur-sm'>
              {movie.lang}
            </span>
          </div>
        )}
      </div>

      {/* Info Container - Cleaner */}
      <div className='p-3 space-y-0.5 bg-slate-900/90'>
        <h2 className='text-[13px] font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors duration-300'>
          {movie.name}
        </h2>
        <p className='text-[10px] text-white/40 line-clamp-1 font-light tracking-wide'>{movie.origin_name}</p>

        <div className='flex items-center justify-between pt-1.5'>
          <span className='text-[10px] text-white/30 font-light'>{movie.year}</span>

          <div className='flex gap-1 overflow-hidden'>
            {movie.category?.slice(0, 1).map(cat => (
              <span key={cat.id} className='text-[10px] text-white/30 font-light truncate'>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
