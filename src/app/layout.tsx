import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/component/layout/navbar'
import QueryProvider from '@/app/provider'
import { Suspense } from 'react'
import NProgressInit from '@/component/layout/NProgressInit'
import { AuthProvider } from './auth-provider'
import Footer from '@/component/layout/footer'
import ChatWidget from '@/component/chat-widget/chat-widget'

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
    <html lang='vi'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <Suspense>
            <NProgressInit />
          </Suspense>
          <AuthProvider>
            <div className='c-app'>
              <Navbar />
              {children}
              <ChatWidget />
              <Footer />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
