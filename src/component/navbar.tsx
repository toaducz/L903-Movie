'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import menu from '@/assets/menu.png'
import { useQuery } from '@tanstack/react-query'
import { getCategorySlug } from '@/api/kkphim/filter/get-category-slug'
import { getCountrySlug } from '@/api/kkphim/filter/get-country-slug'

type DropdownItem = { _id: string; slug: string; name: string }

export default function Navbar() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [openMenu, setOpenMenu] = useState<'category' | 'country' | 'year' | null>(null)
  const { data: categoryData, isLoading: categoryLoading } = useQuery(getCategorySlug())
  const { data: countryData, isLoading: countryLoading } = useQuery(getCountrySlug())
  const years = Array.from({ length: new Date().getFullYear() - 1970 + 1 }, (_, i) => ({
    _id: String(1970 + i),
    slug: String(1970 + i),
    name: String(1970 + i)
  })).reverse()

  const getItems = (): DropdownItem[] => {
    if (openMenu === 'category') {
      if (categoryLoading) return [{ _id: 'loading', slug: 'loading', name: 'Đang tải...' }]
      return categoryData ?? []
    }
    if (openMenu === 'country') {
      if (countryLoading) return [{ _id: 'loading', slug: 'loading', name: 'Đang tải...' }]
      return countryData ?? []
    }
    if (openMenu === 'year') return years
    return []
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setOpenMenu(null)
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
    { href: { pathname: '/list-movie', query: { typelist: 'phim-vietsub', page: 1 } }, label: 'Vietsub' },
    { href: { pathname: '/list-movie', query: { typelist: 'phim-long-tieng', page: 1 } }, label: 'Lồng tiếng' },
    {
      href: { pathname: '/list-movie', query: { typelist: 'hoat-hinh', country: 'nhat-ban', page: 1 } },
      label: 'Anime',
      tooltip: 'Tất nhiên là phải có Anime rồi!'
    },
    { href: { pathname: '/list-movie/category', query: { category: 'hanh-dong', page: 1 } }, label: 'Thể loại' },
    { href: { pathname: '/list-movie/country', query: { country: 'han-quoc', page: 1 } }, label: 'Quốc Gia' },
    { href: { pathname: '/list-movie/year', query: { year: '2025', page: 1 } }, label: 'Năm' },
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
        <Link
          href='/'
          className='text-2xl font-bold text-white hover:text-slate-300 transition-colors duration-200 hover:scale-105'
        >
          L903 Movie
        </Link>

        {/* Navigation Items - Desktop */}
        <div className='hidden lg:flex items-center gap-8 text-base font-medium relative'>
          {navLinks.map((link, i) => {
            const isDropdown = ['Thể loại', 'Quốc Gia', 'Năm'].includes(link.label)

            if (isDropdown) {
              const menuKey = link.label === 'Thể loại' ? 'category' : link.label === 'Quốc Gia' ? 'country' : 'year'

              return (
                <div key={i} className='relative group'>
                  <button
                    onClick={() => setOpenMenu(openMenu === menuKey ? null : menuKey)}
                    className='flex items-center gap-1 text-white hover:text-slate-300 transition-colors duration-200 cursor-pointer '
                  >
                    {link.label}
                    <span className='transition-transform duration-200 text-[10px] leading-none'>▼</span>
                    <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-slate-300 transition-all duration-300 group-hover:w-full'></span>
                  </button>

                  {openMenu === menuKey && (
                    <div className='absolute left-0 top-full mt-2 w-48 max-h-72 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50'>
                      {getItems().map(item => {
                        const href = `/list-movie/${menuKey}?${menuKey}=${item.slug}&page=1`

                        return (
                          <Link
                            key={item.slug}
                            href={item.slug === 'loading' ? '#' : href}
                            onClick={() => setOpenMenu(null)}
                            className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 ${
                              item.slug === 'loading' ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={i}
                href={link.href}
                className='relative text-white hover:text-slate-300 transition-colors duration-200 group'
              >
                {link.label}
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-slate-300 transition-all duration-300 group-hover:w-full'></span>
              </Link>
            )
          })}
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
