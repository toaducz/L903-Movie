'use client' // Bắt buộc phải có để báo Next.js đây là Client Component

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Import động Deep Chat, tắt chế độ SSR
const DeepChat = dynamic(() => import('deep-chat-react').then(mod => mod.DeepChat), { ssr: false })

export default function ChatWidget() {
  // State quản lý việc đóng/mở bong bóng chat
  const [isOpen, setIsOpen] = useState(false)

  // Hàm xử lý logic khi user gõ tin nhắn và bấm gửi
  //   const handleChatRequest = async (body: any, signals: any) => {
  //     const userMessage = body.messages[0].text

  //     // Bật hiệu ứng typing
  //     signals.onResponse({ text: 'Đang xử lý...', overwrite: true })

  //     try {
  //       // TẠI ĐÂY: Bạn sẽ gọi tới cái AniMapper API hoặc backend của bạn
  //       // Ví dụ giả lập độ trễ API:
  //       await new Promise(resolve => setTimeout(resolve, 1500))

  //       // Trả kết quả về cho cửa sổ chat
  //       signals.onResponse({
  //         text: `Tôi đã nhận được yêu cầu: "${userMessage}". API của bạn sẽ gắn vào đây!`,
  //         overwrite: true
  //       })
  //     } catch (error) {
  //       signals.onResponse({ error: 'Có lỗi xảy ra khi gọi API!' })
  //     }
  //   }

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end'>
      {/* Khung chat Deep Chat */}
      {isOpen && (
        <div className='mb-4 shadow-2xl rounded-xl overflow-hidden bg-white'>
          <DeepChat
            demo={true}
            style={{ width: '350px', height: '500px', borderRadius: '12px' }}
            messageStyles={{
              default: {
                user: { bubble: { backgroundColor: '#2563eb', color: 'white' } },
                ai: { bubble: { backgroundColor: '#f3f4f6', color: 'black' } }
              }
            }}
            // request={{ handler: handleChatRequest }}
            textInput={{ placeholder: { text: 'Hỏi phim gì đi...' } }}
            // initialMessages={[{ role: 'ai', text: 'Chào bạn! Mình là AI Agent tìm phim. Mình có thể giúp gì?' }]}
          />
        </div>
      )}

      {/* Nút bấm (Bong bóng) để mở/tắt chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors'
      >
        {isOpen ? (
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        ) : (
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
            />
          </svg>
        )}
      </button>
    </div>
  )
}
