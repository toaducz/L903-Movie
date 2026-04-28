'use client'

/**
 * MoodSection — AI Agent "Xem gì hôm nay?" placeholder.
 * Chức năng sẽ được bổ sung sau.
 */
export default function MoodSection() {
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
            Hỏi mình đi! AI Agent tìm phim 24/7, không quảng cáo, không spam, không lừa. Chỉ cần mô tả mood là xong.
          </p>
          <button
            disabled
            className='inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-[var(--c-pink)] transition-all duration-150
                       opacity-80 cursor-not-allowed'
            style={{
              background: 'var(--c-bg)',
              boxShadow: '5px 5px 0 var(--c-yel)'
            }}
            title='Tính năng đang phát triển'
          >
            Hỏi mình ›<span className='text-[10px] font-normal text-white/60 ml-1'>(sắp ra mắt)</span>
          </button>
        </div>

        {/* Decorative placeholder */}
        {/* <div className='hidden sm:flex w-48 h-32 rounded-2xl items-center justify-center text-5xl select-none'
          style={{ background: 'rgba(13,10,20,.35)' }}>
          🤖
        </div> */}
      </div>
    </section>
  )
}
