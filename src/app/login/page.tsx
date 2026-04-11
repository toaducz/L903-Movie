'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../auth-provider'
import { useRouter } from 'next/navigation'
import Loading from '@/component/status/loading'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-900'>
        <Loading />
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      // const result = await res.json()

      if (!res.ok) {
        setError('Đăng nhập thất bại')
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError('Đăng nhập thất bại' + err)
    }

    setIsSubmitting(false)
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-900'>
      {!user?.id ? (
        <form onSubmit={handleLogin} className='bg-slate-800 p-6 rounded-lg shadow-md w-80'>
          <h2 className='text-xl font-bold mb-4 text-center'>Đăng nhập</h2>

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='w-full mb-3 px-3 py-2 border rounded'
            required
          />

          <input
            type='password'
            placeholder='Mật khẩu'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full mb-3 px-3 py-2 border rounded'
            required
          />

          {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer'
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          {/* <div className='italic items-center pt-6 text-center underline cursor-pointer hover:opacity-80'>Đăng kí</div> */}
        </form>
      ) : null}
    </div>
  )
}
