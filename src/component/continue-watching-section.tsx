'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchingInProgress, WatchingItem } from '@/utils/local-storage'
import { useAuth } from '@/app/auth-provider'

type DbItem = {
  slug: string
  name: string
  image: string
  episode_name?: string
  progress: number
  duration: number
}

export default function ContinueWatchingSection() {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchingItem[]>([])

  useEffect(() => {
    if (user) {
      fetch('/api/history')
        .then(res => res.json())
        .then(json => {
          const dbItems: WatchingItem[] = (json.data ?? [])
            .filter((d: DbItem) => d.episode_name && d.progress > 30 && d.duration > 0)
            .map((d: DbItem) => {
              const percent = Math.min(Math.round((d.progress / d.duration) * 100), 99)
              return { ...d, episodeName: d.episode_name, percent }
            })
            .filter((d: WatchingItem) => d.percent < 95)
          setItems(dbItems)
        })
    } else {
      setItems(getWatchingInProgress())
    }
  }, [user])

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
              <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-600'>
                <div className='h-full bg-red-500' style={{ width: `${item.percent}%` }} />
              </div>
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
