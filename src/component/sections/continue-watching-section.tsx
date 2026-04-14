'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchingInProgress, WatchingItem } from '@/utils/local-storage'

import { useQuery } from '@tanstack/react-query'

type DbItem = {
  slug: string
  name: string
  image: string
  episode_name?: string
  progress: number
  duration: number
}

export default function ContinueWatchingSection() {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['continue_watching'],
    queryFn: async () => {
      const res = await fetch('/api/history')
      if (res.status === 401) {
        return getWatchingInProgress().slice(0, 20)
      }
      const json = await res.json()
      if (!json || !json.data) {
        return getWatchingInProgress().slice(0, 20)
      }
      const dbItems: WatchingItem[] = json.data
        .filter((d: DbItem) => {
          if (!d.episode_name || d.duration <= 0) return false
          const isMovie = d.episode_name.toLowerCase() === 'full' || /^tập\s*0?1$/i.test(d.episode_name)
          return d.progress > 30 || !isMovie
        })
        .map((d: DbItem) => {
          const percent = Math.min(Math.round((d.progress / d.duration) * 100), 99)
          return { ...d, episodeName: d.episode_name, percent }
        })
        .filter((d: WatchingItem) => d.percent < 95)
      const merged = dbItems.length > 0 ? dbItems : getWatchingInProgress()
      return merged.slice(0, 20)
    }
  })

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [items])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  if (isLoading || items.length === 0) return null

  return (
    <div className='px-2 sm:px-4 pt-6 pb-2'>
      <h1 className='text-white font-bold text-xl mb-4'>Đang xem</h1>
      <div className='relative group/row'>
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className='cursor-pointer absolute left-0 top-0 bottom-2 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-black/70 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-200'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-7 text-white drop-shadow'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className='absolute right-0 top-0 bottom-2 z-10 w-10 flex items-center justify-center bg-gradient-to-l cursor-pointer from-black/70 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-200'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-7 text-white drop-shadow'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
            </svg>
          </button>
        )}
        <div ref={scrollRef} className='flex gap-4 overflow-x-auto pb-2 no-scrollbar'>
          {items.map(item => (
            <Link
              key={item.slug}
              href={`/detail-movie/${item.slug}?watch=1&ep=${encodeURIComponent(item.episodeName ?? '')}&t=${Math.floor(
                item.progress
              )}`}
              className='flex-shrink-0 w-36 sm:w-44 group'
            >
              <div className='relative rounded-lg overflow-hidden bg-gray-800'>
                <Image
                  src={`https://wsrv.nl/?url=${encodeURIComponent(item.image)}&w=400&h=600&fit=cover`}
                  alt={item.name}
                  width={176}
                  height={264}
                  unoptimized
                  className='w-full h-52 sm:h-64 object-cover group-hover:opacity-75 transition-opacity duration-200'
                />
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-600'>
                  <div className='h-full bg-red-500' style={{ width: `${item.percent}%` }} />
                </div>
                <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                  <div className='bg-black/60 rounded-full p-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-8 w-8 text-white'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className='mt-2 px-1'>
                <p className='text-white text-sm font-medium line-clamp-1'>{item.name}</p>
                <p className='text-gray-400 text-xs mt-0.5'>
                  {item.episodeName} · {item.percent}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
