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

      const mergedOptions = {
        ...options,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          skipButtons: { backward: 10, forward: 10 },
          ...((options as Record<string, unknown>)?.controlBar as object ?? {}),
        },
      }

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
        let mutedByAd = false

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

        player.on('timeupdate', () => {
          if (adRegions.length === 0) return
          const currentTime = player.currentTime()!

          const region = adRegions.find(r => currentTime >= r.start && currentTime < r.end)
          if (region) {
            player.currentTime(region.end + 1)
            if (!player.muted()) {
              player.muted(true)
              mutedByAd = true
            }
          } else if (mutedByAd) {
            player.muted(false)
            mutedByAd = false
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
