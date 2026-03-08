'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchingInProgress, WatchingItem } from '@/utils/local-storage'

export default function ContinueWatchingSection() {
  const [items, setItems] = useState<WatchingItem[]>([])

  useEffect(() => {
    setItems(getWatchingInProgress())
  }, [])

  if (items.length === 0) return null

  return (
    <div className='px-2 sm:px-4 pt-6 pb-2'>
      <h2 className='text-white font-bold text-xl mb-4'>Đang xem dở</h2>
      <div className='flex gap-4 overflow-x-auto pb-2 scrollbar-hide'>
        {items.map(item => (
          <Link
            key={item.slug}
            href={`/detail-movie/${item.slug}?watch=1&ep=${encodeURIComponent(item.episodeName ?? '')}`}
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
              {/* Progress bar */}
              <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-600'>
                <div
                  className='h-full bg-red-500'
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              {/* Play overlay */}
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <div className='bg-black/60 rounded-full p-2'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-white' viewBox='0 0 20 20' fill='currentColor'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                  </svg>
                </div>
              </div>
            </div>
            <div className='mt-2 px-1'>
              <p className='text-white text-sm font-medium line-clamp-1'>{item.name}</p>
              <p className='text-gray-400 text-xs mt-0.5'>{item.episodeName} · {item.percent}%</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
