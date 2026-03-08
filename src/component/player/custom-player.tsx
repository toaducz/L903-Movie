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

const CustomPlayer: React.FC<CustomPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // initialize HLS.js
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      setVolume(video.volume)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

interface VHSTech {
  vhs?: {
    playlists: {
      media: () => VHSPlaylist | undefined
    }
  }
}

type VideoJsPlayerOptions = Parameters<typeof videojs>[1]

  const skipBackward = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 10)
  }, [])

  const skipForward = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(video.duration, video.currentTime + 10)
  }, [])

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

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
        const playerEl = player.el() as HTMLElement | null
        if (playerEl) {
          playerEl.addEventListener('mousemove', handleMouseMove)
        }

        // đúp 2 bên để tua 10s
        // const handleDoubleClick = (e: MouseEvent) => {
        //   if (!playerEl) return
          
        //   const playerWidth = playerEl.offsetWidth
        //   const clickX = e.offsetX

        //   if (clickX < playerWidth / 2) {
        //     player.currentTime(player.currentTime()! - 10)
        //   } else {
        //     player.currentTime(player.currentTime()! + 10)
        //   }
        // }
        // if (playerEl) {
        //   playerEl.addEventListener('dblclick', handleDoubleClick)
        // }

        // xoay ngang
        const handleFullscreenChange = () => {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          
          if (!isMobile) return

          if (player.isFullscreen()) {
            try {
              if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
                const orientation = window.screen.orientation as ScreenOrientation & { lock: (type: string) => Promise<void> }
                orientation.lock('landscape').catch(() => {})
              }
            } catch (error) {
              console.warn('Không thể khóa màn hình ngang:', error)
            }
          } else {
            try {
              if (window.screen && window.screen.orientation && 'unlock' in window.screen.orientation) {
                const orientation = window.screen.orientation as ScreenOrientation & { unlock: () => void }
                orientation.unlock()
              }
            } catch (error) {
              console.warn('Không thể mở  khóa màn hình:', error)
            }
          }
        }
        player.on('fullscreenchange', handleFullscreenChange)

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
          if (playerEl) {
            playerEl.removeEventListener('mousemove', handleMouseMove)
          }
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

  // Close speed menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowSpeedMenu(false)
    if (showSpeedMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSpeedMenu])

  // fromat time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      //   className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-lg"
    >
      <video ref={videoRef} poster={poster} className='w-full max-h-160' onClick={togglePlay} />
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } hover:opacity-100`}
      >
        {/* Progress Bar */}
        <div className='mb-2'>
          <input
            type='range'
            min='0'
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className='w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer'
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 0%)`
            }}
          />
          <div className='flex justify-between text-xs mt-1'>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className='p-2 hover:bg-white/20 rounded-full transition-colors'
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                </svg>
              ) : (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M5 3l14 9-14 9V3z' />
                </svg>
              )}
            </button>

            {/* Skip Backward 10s */}
            <button
              onClick={skipBackward}
              className='p-2 hover:bg-white/20 rounded-full transition-colors'
              title='Rewind 10s'
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z' />
                <text x='8' y='15' fontSize='6' fontWeight='bold' fill='currentColor'>10</text>
              </svg>
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={skipForward}
              className='p-2 hover:bg-white/20 rounded-full transition-colors'
              title='Forward 10s'
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z' />
                <text x='8' y='15' fontSize='6' fontWeight='bold' fill='currentColor'>10</text>
              </svg>
            </button>

            {/* Volume */}
            <div className='flex items-center space-x-2'>
              <button
                onClick={toggleMute}
                className='p-2 hover:bg-white/20 rounded-full transition-colors'
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M6 7l6-5v16l-6-5H3v-6h3zm15 0l-3 3m0-3l3 3' />
                  </svg>
                ) : (
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M6 7l6-5v16l-6-5H3v-6h3zm6-3.5c3 0 5.5 2.5 5.5 5.5s-2.5 5.5-5.5 5.5' />
                  </svg>
                )}
              </button>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={volume}
                onChange={handleVolumeChange}
                className='w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer'
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${volume * 100}%, #4b5563 0%)`
                }}
              />
            </div>
          </div>

          {/* Playback Speed */}
          <div className='relative'>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(prev => !prev) }}
              className='px-2 py-1 text-sm hover:bg-white/20 rounded transition-colors font-medium min-w-[44px]'
              title='Playback speed'
            >
              {playbackSpeed}x
            </button>
            {showSpeedMenu && (
              <div className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/90 rounded shadow-lg overflow-hidden'>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-white/20 transition-colors ${
                      playbackSpeed === speed ? 'text-blue-400 font-semibold' : 'text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className='p-2 hover:bg-white/20 rounded-full transition-colors'
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M5 5h5v3H8v2H5V5zm9 0h5v5h-3V8h-2V5zm5 9h-5v5h3v-2h2v-3zm-9 5H5v-5h3v2h2v3z' />
              </svg>
            ) : (
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M3 3h6v3H3V3zm12 0h6v3h-6V3zm6 12h-6v3h6v-3zM3 15h6v3H3v-3z' />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer