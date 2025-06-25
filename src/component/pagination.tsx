import React, { useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState('')

  const handleJump = () => {
    let page = parseInt(inputPage)
    if (isNaN(page) || page < 1) page = 1
    if (page > totalPages) page = totalPages
    onPageChange(page)
    setInputPage('')
  }

  const getPageNumbers = () => {
    const delta = 2
    const range: (number | string)[] = []
    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    range.push(1)
    if (left > 2) range.push('...')
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push('...')
    if (totalPages > 1) range.push(totalPages)

    return range
  }

  if (totalPages <= 1) return null

  return (
    <div className='flex flex-wrap items-center justify-center gap-2 mt-6 text-sm scale-110 text-white'>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className='px-2 py-1 bg-stale-700 rounded disabled:opacity-50 '
      >
        ⏮
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='px-2 py-1 bg-stale-700 rounded disabled:opacity-50 '
      >
        «
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={idx} className='px-2 py-1 text-gray-400'>
            ...
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => onPageChange(page as number)}
            className={`px-2 py-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-stale-200 text-white'}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='px-2 py-1 bg-stale-200 rounded disabled:opacity-50'
      >
        »
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className='px-2 py-1 bg-stale-200 rounded disabled:opacity-50'
      >
        ⏭
      </button>

      <input
        type='number'
        min={1}
        max={totalPages}
        value={inputPage}
        onChange={e => setInputPage(e.target.value)}
        className='w-16 px-2 py-1 border border-gray-300 rounded no-spinner'
        placeholder='Trang'
      />
      <button onClick={handleJump} className='px-3 py-1 bg-blue-500 text-white rounded'>
        Đi
      </button>
    </div>
  )
}

export default Pagination
