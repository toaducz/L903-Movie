'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { getLatestUpdateMovieList } from '@/api/getUpdatedMovie'

export default function Home() {
  const { data: updateMovie } = useQuery(getLatestUpdateMovieList({ page: 1 }))

  // console.log(updateMovie)

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      {updateMovie?.items.map((movie, index) => (
        <div key={`${index} + ${movie._id}`}>
          <Image unoptimized src={movie.poster_url} alt={`${index} + ${movie._id}`} width={200} height={300} />
        </div>
      ))}
    </div>
  )
}
