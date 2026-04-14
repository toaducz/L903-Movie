'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Movie } from '@/api/kkphim/get-update-movie'
import React, { useState } from 'react'

type Props = {
  movie: Movie
  color?: string
  source?: string
  index?: number
}

export default function MovieItem({ movie, color, source, index }: Readonly<Props>) {
  const [isLoaded, setIsLoaded] = useState(false)

  const normalizePosterUrl = (posterUrl: string | object | null | undefined) => {
    if (!posterUrl || typeof posterUrl === 'object') return null
    const temp = String(posterUrl).trim()
    if (temp === '{}' || temp === '') return null
    return temp.startsWith('http') ? temp : `https://phimimg.com/${temp.replace(/^\/+/, '')}`
  }

  const poster = normalizePosterUrl(movie.poster_url)
  const thumb = normalizePosterUrl(movie.thumb_url)

  // FIX: Giảm w xuống 250 và q xuống 60 để load cực nhanh
  const optimizedUrl = (url: string | null) => {
    if (!url) return ''
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=250&h=375&fit=cover&output=webp&q=60`
  }

  // Xác định xem có phải hàng đầu tiên không (ví dụ 6 cái đầu)
  const isPriority = index !== undefined && index < 6

  return (
    <Link
      href={source ? `/${source}/detail-movie/${movie.slug}` : `/detail-movie/${movie.slug}`}
      className={`group block relative rounded-xl overflow-hidden transition-all duration-500 ${
        color ?? 'bg-slate-900/40'
      } border border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1`}
    >
      <div className='relative aspect-[2/3] overflow-hidden bg-slate-800'>
        {!isLoaded && <div className='absolute inset-0 bg-slate-800 animate-pulse' />}
        <Image
          src={optimizedUrl(poster ?? thumb) || 'https://via.placeholder.com/250x375?text=No+Poster'}
          alt={movie.name}
          fill
          // FIX: Tối ưu sizes để trình duyệt chọn luồng tải chuẩn
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1536px) 20vw, 15vw'
          loading={isPriority ? undefined : 'lazy'} // Hàng đầu không dùng lazy
          priority={isPriority} // Hàng đầu tiên load ngay lập tức
          onLoad={() => setIsLoaded(true)}
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          unoptimized
        />

        {/* Hover Overlay */}
        <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
          <div className='w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-300'>
            <svg className='w-5 h-5 text-white ml-0.5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M8 5.14v14c0 .86.84 1.4 1.58.97l11-7a1.12 1.12 0 0 0 0-1.94l-11-7a1.13 1.13 0 0 0-1.58 1z' />
            </svg>
          </div>
        </div>

        {/* Badges */}
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

        {movie.lang && (
          <div className='absolute bottom-2 left-2'>
            <span className='px-1.5 py-0.5 bg-black/40 text-white/70 text-[9px] rounded-sm backdrop-blur-sm'>
              {movie.lang}
            </span>
          </div>
        )}
      </div>

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
