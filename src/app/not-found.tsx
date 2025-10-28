'use client'

import Image from 'next/image'
import Link from 'next/link'
import notFound from '@/assets/image/pekora-not-found.jpg'

export default function NotFoundPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-black text-slate-100 px-6 py-12'>
      <div className='flex flex-col items-center text-center  space-y-6'>
        <Image
          unoptimized
          src={notFound}
          alt='Not Found'
          width={220}
          height={220}
          className='rounded-lg mb-6 object-contain'
        />

        <h1 className='text-2xl md:text-3xl font-bold mb-3'>Không tìm thấy trang này</h1>
        <p>Trang này hiện đang không tồn tại hoặc đang phát triển, vui lòng quay lại sau!</p>
        <Link
          href='/'
          className='mt-3 inline-block px-5 py-2 bg-gray-700 text-white font-medium rounded-lg hover:opacity-80 transition'
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  )
}
