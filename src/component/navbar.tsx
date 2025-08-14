'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import menu from '@/assets/menu.png'

export default function Navbar() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      const encoded = encodeURIComponent(search.trim())
      router.push(`/search?q=${encoded}&page=1`)
      setSearch('')
      setIsMenuOpen(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev)
  }

  const navLinks = [
    { href: { pathname: '/list-movie', query: { typeList: 'phim-vietsub', page: 1 } }, label: 'Phim Vietsub' },
    { href: { pathname: '/list-movie', query: { typeList: 'phim-long-tieng', page: 1 } }, label: 'Phim Lồng tiếng' },
    { href: { pathname: '/list-movie', query: { typeList: 'phim-thuyet-minh', page: 1 } }, label: 'Phim Thuyết minh' },
    { href: { pathname: '/list-movie', query: { typeList: 'tv-shows', page: 1 } }, label: 'TV Shows' },
    { href: {}, label: 'Năm' },
    {
      href: { pathname: '/nguonc/home', query: { page: 1 } },
      label: 'Nguonc.com',
      tooltip: 'Ở đây cũng nhiều phim chất lắm, mỗi tội có quảng cáo :v'
    }
  ]

  return (
    <nav
      className={`bg-slate-900 text-white shadow-md w-screen fixed top-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
        {/* Logo */}
        <Link
          href='/'
          className='text-2xl font-bold text-white hover:text-slate-300 transition-colors duration-200 hover:scale-105'
        >
          L903 Movie
        </Link>

        {/* Navigation Items - Desktop */}
        <div className='hidden lg:flex items-center gap-8 text-base font-medium'>
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className='relative text-white hover:text-slate-300 transition-colors duration-200 group'
            >
              {link.label}
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-slate-300 transition-all duration-300 group-hover:w-full'></span>
              {link.tooltip && (
                <div className='absolute left-1/2 top-full mt-2 w-max p-2 bg-gray-700 text-white text-sm rounded opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 -translate-x-1/2'>
                  {link.tooltip}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Search - Desktop */}
        <form onSubmit={handleSearch} className='hidden sm:flex items-center space-x-2'>
          <input
            type='text'
            placeholder='Tìm theo tên phim'
            className='px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 placeholder-slate-400 text-sm transition-all duration-200'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type='submit'
            className='px-4 py-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-900 hover:scale-105 disabled:bg-slate-600 disabled:text-slate-400 disabled:shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600'
            disabled={!search.trim()}
          >
            Tìm
          </button>
        </form>

        {/* Hamburger Menu - Mobile */}
        <button className='lg:hidden focus:outline-none' onClick={toggleMenu} aria-label='Toggle menu'>
          {isMenuOpen ? (
            // Icon đóng (dùng dấu X bằng CSS)
            <span className='block w-6 h-6 relative'>
              <span className='absolute left-0 top-1/2 w-6 h-0.5 bg-white rotate-45'></span>
              <span className='absolute left-0 top-1/2 w-6 h-0.5 bg-white -rotate-45'></span>
            </span>
          ) : (
            // Icon menu từ file PNG
            <Image src={menu} alt='Menu' width={24} height={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='lg:hidden bg-slate-900 px-4 py-4 flex flex-col gap-4 text-base font-medium border-t border-slate-800'>
          {/* Search - Mobile */}
          <form onSubmit={handleSearch} className='flex items-center space-x-2'>
            <input
              type='text'
              placeholder='Tìm theo tên phim'
              className='flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 placeholder-slate-400 text-sm transition-all duration-200'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              type='submit'
              className='px-4 py-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-900 hover:scale-105 disabled:bg-slate-600 disabled:text-slate-400 disabled:shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600'
              disabled={!search.trim()}
            >
              Tìm
            </button>
          </form>

          {/* Navigation Items - Mobile */}
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className='text-white hover:text-slate-300 transition-colors duration-200'
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
