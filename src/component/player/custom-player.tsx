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

      // bắt bàn phím, sau này có gì hay thì update tiếp
      const player = (playerRef.current = videojs(videoElement, options, () => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') {
            player.currentTime(player.currentTime()! + 10)
          } else if (e.key === 'ArrowLeft') {
            player.currentTime(player.currentTime()! - 10)
          }
        }
        window.addEventListener('keydown', handleKeyDown)

        let adRegions: Array<{ start: number; end: number }> = []

        const calculateAdRegions = () => {
          const tech = player.tech() as unknown as VHSTech
          const vhs = tech?.vhs

          if (!vhs) return
          const media = vhs.playlists.media()
          if (!media) return

          let currentTimeAcc = 0
          const newAdRegions: Array<{ start: number; end: number }> = []

          media.segments.forEach(segment => {
            const url = segment.resolvedUri || segment.uri || ''
            if (/[0-9]{5,}\.ts/.test(url)) {
              newAdRegions.push({
                start: currentTimeAcc,
                end: currentTimeAcc + segment.duration + 1.5 // méo hiểu sao bị lệch
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
