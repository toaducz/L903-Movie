import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/component/navbar'
import QueryProvider from '@/app/provider'
import { Suspense } from 'react'
import NProgressInit from '@/component/NProgressInit'
import { AuthProvider } from './auth-provider'
import Footer from '@/component/footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'L903 Movie',
  description: ''
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stale-900`}>
        <QueryProvider>
          <Suspense>
            <NProgressInit />
          </Suspense>
          <AuthProvider>
            <Navbar />
            {/* <div className='pb-25'></div> */}
            {children}
            {/* <div className='pb-25'></div> */}
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
