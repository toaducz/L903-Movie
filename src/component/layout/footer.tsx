export default function Footer() {
  return (
    <footer className='bg-gray-800 text-gray-300 pb-8 pt-12 px-4 text-sm'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        <div>
          <h2 className='text-white font-semibold mb-2'>L903 Movie</h2>
          <p>Trang xem phim trực tuyến.</p>
        </div>

        <div>
          <h3 className='text-white font-semibold mb-2'>Liên kết</h3>
          <ul className='space-y-1'>
            <li>
              <a href='/about' className='hover:text-white'>
                Giới thiệu
              </a>
            </li>
            <li>
              <a href='/policy' className='hover:text-white'>
                Chính sách
              </a>
            </li>
            <li>
              <a href='/contact' className='hover:text-white'>
                Liên hệ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className='text-white font-semibold mb-2'>Liên hệ</h3>
          <p>
            Email:{' '}
            <a href='mailto:hehe@l903truyentranh.vn' className='hover:text-white'>
              support@l903movie.vn
            </a>
          </p>
          <p>
            Fanpage:{' '}
            <a href='https://facebook.com/' target='_blank' rel='noopener noreferrer' className='hover:text-white'>
              Facebook
            </a>
          </p>
        </div>
      </div>

      {/* Dòng bản quyền */}
      <div className='border-t border-gray-700 mt-6 pt-4 text-center text-gray-500 text-xs'>
        © {new Date().getFullYear()} L903 Movie. Made by the L903 team.
      </div>
    </footer>
  )
}
