'use client'

import { useState } from 'react'
import RecommendationsSection from './recommendations-section'

export default function MoodSection() {
  const [showRec, setShowRec] = useState(false)

  return (
    <section className='px-5 sm:px-10 py-8'>
      <div
        className='max-w-[1400px] mx-auto rounded-3xl px-8 sm:px-12 py-12 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center'
        style={{
          background: 'linear-gradient(135deg, var(--c-pink) 0%, var(--c-orange) 100%)',
          boxShadow: '12px 12px 0 var(--c-yel)'
        }}
      >
        <div>
          <p className='text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white'>Không biết xem gì?</p>
          <p className='text-white/85 text-base sm:text-lg mb-6 max-w-xl leading-relaxed'>
            Để tui gợi ý cho bạn nhe he he :D
          </p>
          <button
            onClick={() => setShowRec(!showRec)}
            className='inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-[var(--c-pink)] transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer'
            style={{
              background: 'var(--c-bg)',
              boxShadow: '5px 5px 0 var(--c-yel)'
            }}
            title='Xem gợi ý'
          >
            Xem gợi ý ›
          </button>
        </div>

        {/* Decorative placeholder */}
        {/* <div className='hidden sm:flex w-48 h-32 rounded-2xl items-center justify-center text-5xl select-none'
          style={{ background: 'rgba(13,10,20,.35)' }}>
          🤖
        </div> */}
      </div>

      {showRec && (
        <div className='mt-8 max-w-[1400px] mx-auto'>
          <RecommendationsSection />
        </div>
      )}
    </section>
  )
}
