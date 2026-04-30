'use client'

import { useState, useEffect } from 'react'

export default function LateNightNotice() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  // Cơ chế ẩn/hiện khi cuộn
  const [isScrollVisible, setIsScrollVisible] = useState(true)

  useEffect(() => {
    // UTC+7 offset = 7 * 60 * 60 * 1000 ms
    const nowUtc7 = new Date(Date.now() + 7 * 60 * 60 * 1000)
    const hour = nowUtc7.getUTCHours()
    if (hour >= 21) setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible || dismissed) return
    const handleScroll = () => {
      // Chỉ hiện khi thanh cuộn ở sát trên cùng (scrollY <= 50)
      if (window.scrollY > 50) {
        setIsScrollVisible(false)
      } else {
        setIsScrollVisible(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visible, dismissed])

  if (!visible || dismissed) return null

  return (
    <>
      {/* Banner cố định ngay dưới navbar (top: 72px = chiều cao navbar) */}
      <div
        style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '9px 16px',
          background: 'linear-gradient(90deg, rgba(20,18,40,.96) 0%, rgba(35,28,60,.96) 50%, rgba(20,18,40,.96) 100%)',
          borderBottom: '1px solid rgba(255,210,60,.2)',
          backdropFilter: 'blur(12px)',
          // Ẩn/hiện mượt theo scroll — y như navbar
          // Phải translate thêm 72px (chiều cao navbar) để đẩy banner hoàn toàn ra khỏi viewport
          transition: 'transform .3s ease',
          transform: isScrollVisible ? 'translateY(0)' : 'translateY(calc(-100% - 72px))'
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'rgba(255,255,255,.8)', fontWeight: 500, textAlign: 'center' }}>
          Sau 9h tối thì server lag điên,{' '}
          <span style={{ color: '#ffd23c', fontWeight: 700 }}>chịu khó F5</span>{' '}
          nha :D
        </p>

        <button
          onClick={() => setDismissed(true)}
          aria-label='Đóng thông báo'
          style={{
            flexShrink: 0,
            background: 'none',
            border: '1px solid rgba(255,255,255,.18)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,.45)',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            letterSpacing: '.04em',
            transition: 'color .15s, border-color .15s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,.85)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,.45)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'
          }}
        >
          Đã hiểu
        </button>
      </div>
    </>
  )
}
