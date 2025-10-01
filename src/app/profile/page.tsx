'use client'

import { useAuth } from '../auth-provider'

export default function LogoutPage() {
  const { logout, user } = useAuth()

  return (
    <div className='pt-30'>
      <h1>Logout Page</h1>
      {user && <p>Logged in as {user.email}</p>}
      <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'red', color: 'white' }}>
        Đăng xuất
      </button>
    </div>
  )
}
