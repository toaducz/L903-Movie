'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/auth-provider'

interface MovieReviewProps {
  slug: string
  name: string
  image: string
}

interface Review {
  id: string
  user_email: string
  score: number
  review_text: string
  updated_at: string
}

export default function MovieReview({ slug, name, image }: MovieReviewProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [score, setScore] = useState<number>(10)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/review?slug=${slug}`)
      const data = await res.json()
      if (data.data) {
        setReviews(data.data)
        // Preview cho user nếu họ đã từng review
        if (user) {
          const myReview = data.data.find((r: Review) => r.user_email === user.email)
          if (myReview) {
            setScore(myReview.score)
            setReviewText(myReview.review_text)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]) // Bỏ user ra khỏi deps để không bị fetch đè liên tục khi component mount auth chậm

  // Cập nhật lại prefill nếu auth load xong sau khi đã fetch review
  useEffect(() => {
    if (user && reviews.length > 0) {
      const myReview = reviews.find((r: Review) => r.user_email === user.email)
      if (myReview) {
        setScore(myReview.score)
        setReviewText(myReview.review_text)
      }
    }
  }, [user, reviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!reviewText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung đánh giá.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          image,
          score,
          review_text: reviewText,
          user_email: user.email
        })
      })
      const result = await res.json()
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        await fetchReviews() // Lấy lại toàn bộ danh sách để thấy review mới nhất ở trang đầu
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Đã có lỗi xảy ra.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg mt-6'>
      <h2 className='text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4'>Đánh giá phim</h2>

      {/* Form đánh giá */}
      {user ? (
        <form onSubmit={handleSubmit} className='mb-10 bg-gray-900/50 p-5 rounded-xl text-gray-200'>
          <h3 className='font-semibold mb-3'>Gốc bình luận của bạn</h3>

          {errorMsg && <p className='text-red-400 mb-3 text-sm'>{errorMsg}</p>}

          <div className='mb-4 flex flex-col sm:flex-row items-baseline sm:items-center gap-4'>
            <label className='font-medium text-gray-300'>Điểm số:</label>
            <div className='flex flex-wrap gap-1'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  type='button'
                  onClick={() => setScore(num)}
                  title={`${num} / 10`}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all text-sm cursor-pointer
                    ${
                      score === num
                        ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/30'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className='ml-auto font-bold text-xl text-yellow-500'>{score}/10</span>
          </div>

          <div className='mb-4'>
            <textarea
              className='w-full bg-gray-800 border border-gray-700 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y'
              placeholder='Bạn nghĩ sao về bộ phim này?...'
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={submitting}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      ) : (
        <div className='mb-10 bg-gray-900/50 p-6 rounded-xl flex flex-col items-center justify-center'>
          <p className='text-gray-400 mb-3'>Bạn cần đăng nhập để có thể tham gia đánh giá.</p>
          <button disabled className='px-6 py-2 bg-gray-600 text-white rounded-lg opacity-50 cursor-not-allowed'>
            Đăng nhập để đánh giá
          </button>
        </div>
      )}

      {/* Danh sách các review */}
      <div>
        <h3 className='font-semibold text-xl mb-4 text-gray-200'>Anh em nói gì về phim này? ({reviews.length})</h3>
        {loading ? (
          <p className='text-gray-500 text-center py-4'>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <div className='text-center py-8 text-gray-500 bg-gray-800/20 rounded-xl border border-gray-700 border-dashed'>
            Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className='space-y-4'>
            {reviews.map(review => {
              const username = review.user_email.split('@')[0]

              return (
                <div key={review.id} className='bg-gray-800/40 p-5 rounded-xl border border-gray-700'>
                  <div className='flex justify-between items-start mb-3 border-b border-gray-700/50 pb-3'>
                    <div>
                      <span className='font-semibold text-blue-400 mr-2'>{username}</span>
                      <span className='text-xs text-gray-500'>
                        {new Date(review.updated_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className='bg-gray-800 rounded-lg px-3 py-1 flex items-center gap-1 shadow-inner border border-gray-700'>
                      <span className='text-yellow-500 font-bold'>★</span>
                      <span className='font-semibold'>{review.score}</span>
                      <span className='text-gray-500 text-xs'>/10</span>
                    </div>
                  </div>
                  <p className='text-gray-300 whitespace-pre-wrap leading-relaxed'>{review.review_text}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
