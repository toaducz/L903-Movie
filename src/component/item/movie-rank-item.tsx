import Image from 'next/image'
import { Movie } from '@/api/getUpdatedMovie'
import { useRouter } from 'next/navigation'

type Props = {
  movie: Movie
  index: number
}

export default function MovieRankItem({ movie, index }: Props) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/detail-movie/${movie.slug}`)
  }

  return (
    <div
      className='flex items-center gap-4 py-2 px-2 bg-stale-500 cursor-pointer hover:opacity-70'
      onClick={handleClick}
    >
      <div className='text-4xl font-extrabold text-blue-500 w-8 text-center px-1'>{index + 1}</div>
      <Image
        unoptimized
        src={movie.thumb_url}
        alt={movie.name}
        width={80}
        height={80}
        className='rounded-md h-[80px] w-[80px] object-cover'
        // style={{ minWidth: '40px', maxHeight: '120px' }}
        //  sizes='100vw'
      />
      <div className='flex flex-col overflow-hidden'>
        <span className='text-white font-medium text-sm line-clamp-2'>{movie.name}</span>
        <span className='text-gray-400 italic text-xs line-clamp-1'>{movie.origin_name}</span>
      </div>
    </div>
  )
}
