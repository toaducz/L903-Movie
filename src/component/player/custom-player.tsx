'use client'

import React, { useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

interface HLSSegment {
  resolvedUri?: string
  uri: string
  duration: number
}

interface VHSPlaylist {
  segments: HLSSegment[]
}

interface VHSTech {
  vhs?: {
    playlists: {
      media: () => VHSPlaylist | undefined
    }
  }
}

type VideoJsPlayerOptions = Parameters<typeof videojs>[1]

interface VideoPlayerProps {
  options: VideoJsPlayerOptions
  onReady?: (player: Player) => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      const player = (playerRef.current = videojs(videoElement, options, () => {
        // bắt bàn phím, có gì hay sẽ thêm sau
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') {
            player.currentTime(player.currentTime()! + 10)
          } else if (e.key === 'ArrowLeft') {
            player.currentTime(player.currentTime()! - 10)
          }
          // bắt sự kiện phím F để bật/tắt chế độ toàn màn hình
          else if (e.key.toLowerCase() === 'f') {
            if (!player.isFullscreen()) {
              player.requestFullscreen()
            } else {
              player.exitFullscreen()
            }
          }
          //space
          else if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault()
            if (player.paused()) {
              player.play()
            } else {
              player.pause()
            }
          }
        }
        window.addEventListener('keydown', handleKeyDown)

        const handleMouseMove = () => {
          player.userActive(true)
        }
        const playerEl = player.el()
        if (playerEl) {
          playerEl.addEventListener('mousemove', handleMouseMove)
        }

        let adRegions: Array<{ start: number; end: number }> = []

        const calculateAdRegions = () => {
          const tech = player.tech() as unknown as VHSTech
          const vhs = tech?.vhs

          if (!vhs) return
          const media = vhs.playlists.media()
          if (!media) return

          let currentTimeAcc = 0
          const newAdRegions: Array<{ start: number; end: number }> = []

          // bắt các khuôn mẫu quảng cáo phổ biến nhất
          // ^ : Bắt đầu chuỗi tên file
          // (segment_.* | ads?_.* | promo_.* | \d{4,}) : Chứa 1 trong các khuôn mẫu
          // \.ts$ : Kết thúc phải là .ts
          // i : Không phân biệt hoa/thường
          const adRegex = /^(segment_.*|ads?_.*|promo_.*|\d{4,})\.ts$/i

          media.segments.forEach(segment => {
            const url = segment.resolvedUri || segment.uri || ''

            // bóc tách lấy đúng phần TÊN FILE cuối cùng (bỏ qua domain và các thư mục)
            // VD: https://s3.abc.com/phim/segment_001.ts -> segment_001.ts
            const fileName = url.split('/').pop()?.split('?')[0] || ''

            if (adRegex.test(fileName)) {
              newAdRegions.push({
                start: currentTimeAcc,
                end: currentTimeAcc + segment.duration + 1.5 // Méo hiểu sao phải 1.5s
              })
            }
            currentTimeAcc += segment.duration
          })

          adRegions = newAdRegions
        }

        player.on('loadedmetadata', calculateAdRegions)
        player.on('mediachange', calculateAdRegions)

        player.on('timeupdate', () => {
          if (adRegions.length === 0) return
          const currentTime = player.currentTime()!
          let isAdPlaying = false

          for (const region of adRegions) {
            if (currentTime >= region.start && currentTime < region.end) {
              isAdPlaying = true

              // skip 1 đoạn và mute âm thanh
              player.currentTime(region.end + 1)
              if (!player.muted()) player.muted(true)

              break
            }
          }

          if (!isAdPlaying && player.muted()) {
            player.muted(false)
          }
        })

        player.on('dispose', () => {
          window.removeEventListener('keydown', handleKeyDown)
          // [THÊM]: Dọn dẹp sự kiện mousemove khi component unmount
          if (playerEl) {
            playerEl.removeEventListener('mousemove', handleMouseMove)
          }
          // [KẾT THÚC THÊM]
        })

        if (onReady) onReady(player)
      }))
    } else if (playerRef.current) {
      const player = playerRef.current
      if (options?.autoplay !== undefined) player.autoplay(options.autoplay)
      if (options?.poster) player.poster(options.poster)
      if (options?.sources) player.src(options.sources)
    }
  }, [options, onReady])

  useEffect(() => {
    return () => {
      const player = playerRef.current
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div data-vjs-player className='absolute top-0 left-0 w-full h-full overflow-hidden'>
      <div ref={videoRef} className='w-full h-full' />
      <style jsx global>{`
        .video-js {
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          top: 0;
          left: 0;
        }
        .vjs-poster {
          background-size: cover !important;
        }
      `}</style>
    </div>
  )
}

export default VideoPlayer