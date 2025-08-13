'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

interface CustomPlayerProps {
  src: string
  poster?: string
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

    return () => {
      if (hls) {
        hls.destroy()
      }
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [src])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(err => console.error('Playback failed:', err))
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  // thời gian
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Number(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Number(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
    setVolume(video.muted ? 0 : video.volume)
  }

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // ẩn hiện con trỏ
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const container = containerRef.current
    if (!container) return

    const showControlsTemporarily = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const handleMouseMove = () => {
      showControlsTemporarily()
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', showControlsTemporarily)
    container.addEventListener('mouseleave', () => setShowControls(false))

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', showControlsTemporarily)
      container.removeEventListener('mouseleave', () => setShowControls(false))
      clearTimeout(timeout)
    }
  }, [])

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

export default CustomPlayer
