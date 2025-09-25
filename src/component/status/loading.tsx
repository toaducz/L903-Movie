'use client'
import loading from '@/assets/gif/loading.gif'
import Image from 'next/image'

interface LoadingProps {
  image?: string
}

const Loading: React.FC<LoadingProps> = ({ image }) => {
  return (
    <div className='flex items-center justify-center min-h-screen min-w-screen bg-black'>
      <div>
        <Image
          unoptimized
          src={image ?? loading}
          alt='Loading...'
          width={50}
          height={50}
          className='object-contain'
          priority
        />
      </div>
    </div>
  )
}

export default Loading
