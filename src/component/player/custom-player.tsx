'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'
import { saveWatchProgress, getWatchProgress, clearWatchProgress, saveWatchDuration } from '@/utils/local-storage'

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
  progressKey?: string
  initialTime?: number
  onEnded?: () => void
  onProgress?: (time: number, duration: number) => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  options,
  onReady,
  progressKey,
  initialTime,
  onEnded,
  onProgress
}) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const currentSrcRef = useRef<string | undefined>(undefined)
  const progressKeyRef = useRef<string | undefined>(progressKey)
  const [seekHint, setSeekHint] = useState<{ side: 'left' | 'right'; key: number } | null>(null)
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null)

  const handleTap = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const player = playerRef.current
    if (!player) return

    const touch = e.changedTouches[0]
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const side = touch.clientX - rect.left < rect.width / 2 ? 'left' : 'right'
    const now = Date.now()
    const last = lastTapRef.current

    if (last && now - last.time < 300 && last.side === side) {
      // double-tap detected
      lastTapRef.current = null
      const delta = side === 'right' ? 10 : -10
      player.currentTime(Math.max(0, (player.currentTime() ?? 0) + delta))
      setSeekHint({ side, key: now })
      setTimeout(() => setSeekHint(null), 700)
    } else {
      lastTapRef.current = { time: now, side }
    }
  }, [])

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      const mergedOptions = {
        ...options,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          skipButtons: { backward: 10, forward: 10 },
          ...(((options as Record<string, unknown>)?.controlBar as object) ?? {})
        }
      }

      currentSrcRef.current = (options?.sources as Array<{ src: string }> | undefined)?.[0]?.src
      progressKeyRef.current = progressKey
      const player = (playerRef.current = videojs(videoElement, mergedOptions, () => {
        // bắt bàn phím
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            player.currentTime(player.currentTime()! + 10)
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            player.currentTime(player.currentTime()! - 10)
          } else if (e.key.toLowerCase() === 'f') {
            if (!player.isFullscreen()) {
              player.requestFullscreen()
            } else {
              player.exitFullscreen()
            }
          } else if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault()
            if (player.paused()) {
              player.play()
            } else {
              player.pause()
            }
          } else if (e.key.toLowerCase() === 'm') {
            player.muted(!player.muted())
          } else if (e.key.toLowerCase() === 't') {
            const doc = document as Document & {
              pictureInPictureElement?: Element
              exitPictureInPicture?: () => Promise<void>
            }
            const videoEl = player.el()?.querySelector('video') as
              | (HTMLVideoElement & {
                  requestPictureInPicture?: () => Promise<void>
                })
              | null
            if (doc.pictureInPictureElement) {
              doc.exitPictureInPicture?.()
            } else if (videoEl?.requestPictureInPicture) {
              videoEl.requestPictureInPicture().catch(() => {})
            }
          } else if (e.key === '[') {
            const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
            const current = player.playbackRate() ?? 1
            const idx = rates.indexOf(current)
            if (idx > 0) player.playbackRate(rates[idx - 1])
          } else if (e.key === ']') {
            const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
            const current = player.playbackRate() ?? 1
            const idx = rates.indexOf(current)
            if (idx < rates.length - 1) player.playbackRate(rates[idx + 1])
          } else if (e.key >= '0' && e.key <= '9') {
            const percent = parseInt(e.key) / 10
            const duration = player.duration()
            if (duration) player.currentTime(duration * percent)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            player.volume(Math.min(1, (player.volume() ?? 1) + 0.1))
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            player.volume(Math.max(0, (player.volume() ?? 0) - 0.1))
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

        // xoay ngang
        const handleFullscreenChange = () => {
          if (player.isFullscreen()) {
            player.focus()
          }
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          if (!isMobile) return

          if (player.isFullscreen()) {
            try {
              if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
                const orientation = window.screen.orientation as ScreenOrientation & {
                  lock: (type: string) => Promise<void>
                }
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
        let mutedByAd = false
        let adRafId: number | null = null

        const calculateAdRegions = () => {
          const tech = player.tech() as unknown as VHSTech
          const vhs = tech?.vhs

          if (!vhs) return
          const media = vhs.playlists.media()
          if (!media) return

          let currentTimeAcc = 0
          const newAdRegions: Array<{ start: number; end: number }> = []

          // segment_\d+ = ad (tên có số thứ tự), content dùng tên random
          const adRegex = /^(segment_\d+|ads?_.*|promo_.*)\.ts$/i

          media.segments.forEach(segment => {
            const url = segment.resolvedUri || segment.uri || ''
            const fileName = url.split('/').pop()?.split('?')[0] || ''

            if (adRegex.test(fileName)) {
              newAdRegions.push({
                start: currentTimeAcc,
                end: currentTimeAcc + segment.duration
              })
            }
            currentTimeAcc += segment.duration
          })

          // Merge các region liền nhau thành 1 để tránh seek nhiều lần
          const merged: Array<{ start: number; end: number }> = []
          for (const region of newAdRegions) {
            const last = merged[merged.length - 1]
            if (last && region.start <= last.end + 1) {
              last.end = Math.max(last.end, region.end)
            } else {
              merged.push({ ...region })
            }
          }
          adRegions = merged
        }

        player.on('loadedmetadata', calculateAdRegions)
        player.on('mediachange', calculateAdRegions)

        const pollAds = () => {
          if (player.isDisposed()) return
          adRafId = requestAnimationFrame(pollAds)

          if (adRegions.length === 0) return
          const currentTime = player.currentTime() ?? 0

          const PRE_MUTE = 0.1
          const upcoming = adRegions.find(r => currentTime >= r.start - PRE_MUTE && currentTime < r.end)
          if (upcoming) {
            if (!mutedByAd) {
              player.muted(true)
              mutedByAd = true
            }
            if (currentTime >= upcoming.start && currentTime < upcoming.end - 0.1) {
              player.currentTime(upcoming.end)
            }
          } else if (mutedByAd) {
            player.muted(false)
            mutedByAd = false
          }
        }
        adRafId = requestAnimationFrame(pollAds)

        player.on('dispose', () => {
          if (adRafId !== null) cancelAnimationFrame(adRafId)
          window.removeEventListener('keydown', handleKeyDown)
          if (playerEl) {
            playerEl.removeEventListener('mousemove', handleMouseMove)
          }
        })

        // Restore vị trí xem — ưu tiên giá trị lớn hơn giữa URL (cross-device) và localStorage (same device)
        const saved = Math.max(initialTime ?? 0, progressKey ? getWatchProgress(progressKey) : 0)
        if (saved > 0) {
          player.one('loadedmetadata', () => {
            player.currentTime(saved)
            player.play()?.catch(() => {})
          })
        }

        // Lưu vị trí xem mỗi 5s
        let lastSaved = 0

        const handleSaveProgress = () => {
          if (!progressKey) return
          const current = player.currentTime() ?? 0
          saveWatchProgress(progressKey, current)
          const dur = player.duration() ?? 0
          if (dur > 0) {
            saveWatchDuration(progressKey, dur)
            onProgress?.(current, dur)
          }
          lastSaved = current
        }

        // Khi video đang chạy
        player.on('timeupdate', () => {
          const current = player.currentTime() ?? 0
          // fix trường hợp tua lùi thì cũng lưu, xài cái này cho nó không âm
          if (Math.abs(current - lastSaved) >= 5) {
            handleSaveProgress()
          }
        })

        // tua cái là lưu luôn ??
        // player.on('seeked', () => {
        //   handleSaveProgress()
        // })

        // Xóa khi xem xong + callback cho parent
        player.on('ended', () => {
          if (progressKey) clearWatchProgress(progressKey)
          onEnded?.()
        })

        if (onReady) onReady(player)
      }))
    } else if (playerRef.current) {
      const player = playerRef.current
      if (options?.autoplay !== undefined) player.autoplay(options.autoplay)
      if (options?.poster) player.poster(options.poster)
      const newSrc = (options?.sources as Array<{ src: string }> | undefined)?.[0]?.src
      if (options?.sources && newSrc !== currentSrcRef.current) {
        currentSrcRef.current = newSrc
        progressKeyRef.current = progressKey
        player.src(options.sources)
        const savedOnChange = Math.max(initialTime ?? 0, progressKey ? getWatchProgress(progressKey) : 0)
        if (savedOnChange > 0) {
          player.one('loadedmetadata', () => {
            player.currentTime(savedOnChange)
            player.play()?.catch(() => {})
          })
        }
      }
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
    <div data-vjs-player className='absolute top-0 left-0 w-full h-full overflow-hidden' onTouchEnd={handleTap}>
      <div ref={videoRef} className='w-full h-full' />
      {seekHint && (
        <div
          key={seekHint.key}
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-white animate-seek-hint ${
            seekHint.side === 'left' ? 'left-6' : 'right-6'
          }`}
        >
          <div className='rounded-full bg-white/20 p-4 text-2xl'>{seekHint.side === 'left' ? '«' : '»'}</div>
          <span className='text-sm font-semibold drop-shadow'>{seekHint.side === 'right' ? '+10s' : '-10s'}</span>
        </div>
      )}
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
