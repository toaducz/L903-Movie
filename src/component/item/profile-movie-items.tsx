'use client'

import Link from 'next/link'
import Image from 'next/image'

type HistoryItemProps = {
  slug: string
  name: string
  image: string
  episodeName?: string
  hideEpisode?: boolean
}

export default function HistoryItem({ slug, name, image, episodeName, hideEpisode }: HistoryItemProps) {
  const href = episodeName
    ? `/detail-movie/${slug}?watch=1&ep=${encodeURIComponent(episodeName)}`
    : `/detail-movie/${slug}`

  return (
    <Link
      href={href}
      className='block rounded-lg overflow-hidden shadow-md hover:opacity-90  transition-shadow duration-300 '
    >
      <div className='relative w-full h-48 bg-gray-200'>
        <Image src={image} alt={name} unoptimized className='object-cover' fill />
      </div>
      <div className='p-2'>
        <h3 className='text-sm font-medium line-clamp-1 overflow-hidden'>{name}</h3>
        {!hideEpisode && (
          <p className='text-xs text-blue-400 mt-1 font-medium'>
            {!episodeName || episodeName.toLowerCase() === 'full' ? 'Tập Full' : episodeName}
          </p>
        )}
      </div>
    </Link>
  )
}
