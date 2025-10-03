'use client'

import Link from 'next/link'
import Image from 'next/image'

type HistoryItemProps = {
  slug: string
  name: string
  image: string
}

export default function HistoryItem({ slug, name, image }: HistoryItemProps) {
  return (
    <Link
      href={`/detail-movie/${slug}`}
      className='block rounded-lg overflow-hidden shadow-md hover:opacity-90  transition-shadow duration-300 '
    >
      <div className='relative w-full h-48 bg-gray-200'>
        <Image src={image} alt={name} unoptimized className='object-cover' fill />
      </div>
      <div className='p-2'>
        <h3 className='text-sm font-medium line-clamp-2'>{name}</h3>
      </div>
    </Link>
  )
}
