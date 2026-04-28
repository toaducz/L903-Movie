'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getDetailMovie } from '@/api/kkphim/get-detail-movie'
import { getSubtitles } from '@/api/proxy/get-subtitles'
import EpisodeList from '@/component/interactive/episode-list'
import SubtitleBadges from '@/component/interactive/subtitle-badges'
import ReactPlayer from 'react-player'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import Image from 'next/image'
import thumbnail from '@/assets/gumaKe.png'
import FavoriteButton from '@/component/interactive/favorite-button'
import { saveViewHistory } from '@/utils/local-storage'
import VideoPlayer from '@/component/player/custom-player'
import { useAuth } from '@/app/auth-provider'
import MovieReview from '@/component/interactive/movie-review'
import type { SubtitleParams, SubtitleCue } from '@/types/subtitle'

const AUTOPLAY_COUNTDOWN = 5

export default function WatchPage() {
  const { slug } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { data, isLoading, isError } = useQuery(getDetailMovie({ slug: String(slug) }))
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  const [useBackup, setUseBackup] = useState<string | null>(null)
  const [useBackupPlayer, setUseBackupPlayer] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null)

  const isWatching = searchParams.get('watch') === '1'
  const epParam = searchParams.get('ep')
  const tParam = Number(searchParams.get('t') ?? 0) || 0
  const isAvailable = data?.movie?.episode_current === 'Trailer'

  const { season: detectedSeason, isSeasonFallback } = useMemo(() => {
    const originName = data?.movie?.origin_name ?? ''
    // Ưu tiên lấy bằng regex từ origin_name (bắt "season N")
    const match = originName.match(/Season\s*(\d+)/i)
    if (match) return { season: parseInt(match[1], 10), isSeasonFallback: false }

    return { season: 1, isSeasonFallback: true }
  }, [data?.movie?.origin_name])

  // ─── Detect số tập từ ep trên URL (e.g. "Tập 5" → 5) ───────────────────────
  // Dùng epParam thay vì episodeToPlay?.name vì episodeToPlay chưa được define
  // ở thời điểm này (nó nằm sau early returns loading/error).
  // epParam và episodeToPlay.name là cùng giá trị vì handleSelectEpisode
  // luôn set params.set('ep', ep.name).
  const currentEpisodeNumber = useMemo(() => {
    const name = epParam ?? ''
    const match = name.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 1
  }, [epParam])

  const subtitleParams = useMemo((): SubtitleParams | null => {
    const tmdbId = data?.movie?.tmdb?.id
    if (!tmdbId || !isWatching) return null
    const isSeries = data.movie.type === 'series'
    if (isSeries) {
      return { tmdbId, type: 'series', season: detectedSeason, episode: currentEpisodeNumber }
    }
    return { tmdbId, type: 'movie' }
  }, [data?.movie?.tmdb?.id, data?.movie?.type, isWatching, detectedSeason, currentEpisodeNumber])

  const { data: subtitleData, isLoading: isSubLoading, error } = useQuery(getSubtitles(subtitleParams))
  const errorMessage =
    error != null
      ? typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Lỗi không xác định'
      : undefined

  const [subtitles1, setSubtitles1] = useState<SubtitleCue[]>([])
  const [subtitles2, setSubtitles2] = useState<SubtitleCue[]>([])

  const goBack = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('watch')
    params.delete('ep')
    params.delete('t')
    router.replace(`?${params.toString()}`)
  }

  // Đặt lại selectedEpisode khi slug thay đổi
  useEffect(() => {
    setSelectedEpisode(null)
  }, [slug])

  // Khôi phục tập đang xem từ URL khi data đã tải
  useEffect(() => {
    if (!data) return
    const allEps = data.episodes.flatMap(s => s.server_data)
    if (isWatching && epParam) {
      const ep = allEps.find(e => e.name === epParam)
      if (ep) {
        setSelectedEpisode(ep.link_embed)
        setUseBackup(ep.link_m3u8)
        return
      }
    }
    if (isWatching && !selectedEpisode && allEps[0]) {
      setSelectedEpisode(allEps[0].link_embed)
      setUseBackup(allEps[0].link_m3u8)
    }
  }, [data, isWatching, epParam])

  // Tự động chọn tập 1 khi data được tải và đang ở chế độ xem phim
  useEffect(() => {
    saveViewHistory({
      name: data?.movie?.name ?? '',
      image: data?.movie?.poster_url ?? '',
      slug: data?.movie?.slug ?? ''
    })
  }, [data])

  // Countdown auto-play tập tiếp theo
  useEffect(() => {
    if (autoplayCountdown === null) return
    if (autoplayCountdown === 0) {
      // Chuyển tập khi đếm về 0
      const eps = data?.episodes?.flatMap(s => s.server_data) ?? []
      const idx = eps.findIndex(ep => ep.link_embed === selectedEpisode)
      if (idx >= 0 && idx < eps.length - 1) {
        const nextEp = eps[idx + 1]
        setSelectedEpisode(nextEp.link_embed)
        setUseBackup(nextEp.link_m3u8)
        setIframeLoading(true)
        const params = new URLSearchParams(searchParams.toString())
        params.set('watch', '1')
        params.set('ep', nextEp.name)
        params.delete('t')
        router.replace(`?${params.toString()}`)
        saveViewHistory({
          name: data?.movie?.name ?? '',
          image: data?.movie?.poster_url ?? '',
          slug: data?.movie?.slug ?? '',
          episodeName: nextEp.name
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setAutoplayCountdown(null)
      return
    }
    const timer = setTimeout(() => setAutoplayCountdown(prev => (prev !== null ? prev - 1 : null)), 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayCountdown])

  if (isLoading) return <Loading />
  if (isError || !data || data.status === false) return <Error message={data?.msg} />

  const flatEpisodes = data.episodes.flatMap(server => server.server_data)
  const currentIndex = flatEpisodes.findIndex(ep => ep.link_embed === selectedEpisode)
  // const backupIndex = flatEpisodes.findIndex(ep => ep.link_m3u8 === selectedEpisode)
  const episodeToPlay = flatEpisodes[currentIndex]
  const movie = data.movie

  const handleSelectEpisode = (ep: string, backup: string, epName?: string) => {
    setSelectedEpisode(ep)
    setUseBackup(backup)
    setIframeLoading(true)
    setAutoplayCountdown(null)
    if (epName) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('watch', '1')
      params.set('ep', epName)
      params.delete('t')
      router.replace(`?${params.toString()}`)
      const historyPayload = {
        name: data?.movie?.name ?? '',
        image: data?.movie?.poster_url ?? '',
        slug: data?.movie?.slug ?? '',
        episodeName: epName
      }
      saveViewHistory(historyPayload)
      if (user) {
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: historyPayload.slug,
            name: historyPayload.name,
            image: historyPayload.image,
            episode_name: epName
          })
        })
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEpisodeEnded = () => {
    if (currentIndex < flatEpisodes.length - 1) {
      setAutoplayCountdown(AUTOPLAY_COUNTDOWN)
    }
  }

  // Giao diện thông tin phim
  if (!isWatching) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-16 scale-91'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Header với backdrop */}
          <div
            className='relative w-full h-80 rounded-xl mb-8 overflow-hidden bg-cover bg-center'
            style={{
              backgroundImage: `url(${movie.poster_url})`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className='absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent' />
            <div className='absolute bottom-0 left-0 w-full p-8'>
              <h1 className='text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg'>{movie.name}</h1>
              <p className='text-xl text-gray-300 italic drop-shadow-md'>{movie.origin_name}</p>
            </div>
          </div>

          <div className='md:flex gap-8'>
            {/* Poster */}
            <div className='md:w-1/3 flex flex-col'>
              <div className='rounded-xl overflow-hidden shadow-2xl transform transition hover:scale-[1.02] duration-300'>
                <Image
                  unoptimized
                  // priority
                  loading='lazy'
                  width={400}
                  height={600}
                  src={movie.poster_url}
                  alt={movie.name}
                  className='w-full h-auto'
                />
              </div>

              <button
                className='mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/50 w-full flex justify-center items-center gap-2 cursor-pointer'
                onClick={() => {
                  const firstEp = data?.episodes?.[0]?.server_data?.[0]
                  if (firstEp) handleSelectEpisode(firstEp.link_embed, firstEp.link_m3u8, firstEp.name)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                    clipRule='evenodd'
                  />
                </svg>
                Xem phim
              </button>

              <div>
                <FavoriteButton slug={movie?.slug} image={movie?.poster_url} name={movie.name} />
              </div>

              <div className='mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg'>
                {movie.tmdb?.vote_average > 0 && (
                  <div className='flex items-center gap-3 mb-4 p-3 bg-gray-700/50 rounded-lg'>
                    <div className='bg-yellow-500 text-black font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg shrink-0'>
                      {movie.tmdb.vote_average.toFixed(1)}
                    </div>
                    <div>
                      <p className='text-xs text-yellow-400 font-semibold uppercase tracking-wide'>TMDB</p>
                      <p className='text-sm text-gray-300'>{movie.tmdb.vote_count.toLocaleString()} lượt đánh giá</p>
                    </div>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-y-2 text-sm text-gray-300'>
                  <div>
                    <span className='font-semibold text-gray-200'>Năm:</span> {movie.year}
                  </div>
                  <div>
                    <span className='font-semibold text-gray-200'>Chất lượng:</span> {movie.quality}
                  </div>
                  <div>
                    <span className='font-semibold text-gray-200'>Ngôn ngữ:</span> {movie.lang}
                  </div>
                  <div>
                    <span className='font-semibold text-gray-200'>Thời lượng:</span> {movie.time}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin phim */}
            <div className='md:w-2/3 mt-6 md:mt-0'>
              <div className='bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6'>
                <h2 className='text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-4'>Thông tin chi tiết</h2>

                <div className='space-y-3 text-gray-300'>
                  <p>
                    <span className='inline-block w-28 font-semibold text-gray-200'>Quốc gia:</span>
                    {movie.country.map(c => c.name).join(', ')}
                  </p>
                  <p>
                    <span className='inline-block w-28 font-semibold text-gray-200'>Thể loại:</span>
                    {movie.category.map(c => c.name).join(', ')}
                  </p>
                  <p>
                    <span className='inline-block w-28 font-semibold text-gray-200'>Diễn viên:</span>
                    {movie.actor.join(', ')}
                  </p>
                  <p>
                    <span className='inline-block w-28 font-semibold text-gray-200'>Đạo diễn:</span>
                    {movie.director.join(', ')}
                  </p>
                  <p>
                    <span className='inline-block w-28 font-semibold text-gray-200'>Tập hiện tại:</span>
                    {movie.episode_current === 'Full' ? 'Full' : `${movie.episode_current} / ${movie.episode_total}`}
                  </p>
                </div>
              </div>

              <div className='bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg'>
                <h2 className='text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-4'>Nội dung</h2>
                <p className='text-gray-300 leading-relaxed'>{movie.content}</p>
              </div>

              {/* Thể loại tags */}
              <div className='mt-6'>
                <h2 className='text-xl font-bold mb-3'>Thể loại:</h2>
                <div className='flex flex-wrap gap-2'>
                  {movie.category.map(cat => (
                    <span
                      key={cat.name}
                      className='px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-sm'
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trailer */}
          {movie.trailer_url && (
            <div className='mt-12'>
              <h2 className='text-2xl font-bold mb-4 border-l-4 border-red-500 pl-4'>Trailer</h2>
              <div className='rounded-xl overflow-hidden shadow-2xl'>
                <ReactPlayer
                  url={movie.trailer_url}
                  controls
                  width='100%'
                  height='500px'
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1 }
                    }
                  }}
                />
              </div>
            </div>
          )}

          <MovieReview slug={movie.slug} name={movie.name} image={movie.poster_url} />
        </div>
      </div>
    )
  }

  // Giao diện phát video
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-10 pb-16'>
      <div className='max-w-6xl mx-auto px-4'>
        <button
          className='mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition duration-300 flex items-center gap-2 shadow-lg'
          onClick={() => goBack()}
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
          Quay lại thông tin phim
        </button>

        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-3xl font-bold'>{movie.name}</h1>
          <span className='text-gray-400 italic'>{movie.origin_name}</span>
        </div>

        {/* Player trong card */}
        <div className='bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl mb-8'>
          {selectedEpisode && episodeToPlay ? (
            <div>
              <div className='bg-gray-700 p-4'>
                <h2 className='text-xl font-semibold'>{episodeToPlay.name}</h2>
                {/* Phụ đề khả dụng (đi ăn trộm) */}
                <SubtitleBadges
                  data={subtitleData ?? null}
                  isLoading={isSubLoading}
                  errorMessage={errorMessage}
                  isSeasonFallback={data?.movie?.type === 'series' && isSeasonFallback}
                  onSub1Change={setSubtitles1}
                  onSub2Change={setSubtitles2}
                />
                <details className='mt-3 border-t border-gray-600/50 pt-2 text-xs text-gray-400 group'>
                  <summary className='cursor-pointer select-none italic hover:text-gray-300 list-none flex items-center gap-1'>
                    <span className='transition-transform group-open:rotate-90 text-[10px]'>▶</span>
                    Mẹo: Cách chỉnh độ trễ phụ đề (Sync)
                  </summary>
                  <div className='pl-4 mt-2 italic leading-relaxed text-gray-400'>
                    Nhấn phím <kbd className='bg-gray-600 px-1 rounded text-gray-200'>Z</kbd> /{' '}
                    <kbd className='bg-gray-600 px-1 rounded text-gray-200'>X</kbd> để ép phụ đề hiện sớm hoặc trễ hơn
                    0.5s (lệch tiếng nhiều lắm, cái này chịu :D).
                  </div>
                </details>
              </div>
              <div className='flex justify-center my-4'>
                <button
                  onClick={() => setUseBackupPlayer(prev => !prev)}
                  className={`px-4 py-2 text-sm font-medium rounded transition cursor-pointer
            ${
              useBackupPlayer
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
                >
                  {useBackupPlayer ? 'Đang dùng dự phòng - Đổi về Server chính' : 'Link dự phòng (Có quảng cáo)'}
                </button>
              </div>

              {/* Wrapper giữ tỉ lệ 16:9 */}
              <div className='relative pt-[56.25%] rounded-xl overflow-hidden shadow-2xl bg-black'>
                {!useBackupPlayer ? (
                  <VideoPlayer
                    progressKey={`${slug}_${episodeToPlay.name}`}
                    initialTime={tParam}
                    onEnded={handleEpisodeEnded}
                    onProgress={
                      user
                        ? (time, duration) => {
                            fetch('/api/history', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                slug: movie.slug,
                                name: movie.name,
                                image: movie.poster_url,
                                episode_name: episodeToPlay.name,
                                progress: time,
                                duration
                              })
                            })
                          }
                        : undefined
                    }
                    options={{
                      autoplay: false,
                      controls: true,
                      responsive: false,
                      fluid: false,
                      poster: thumbnail.src,

                      sources: [
                        {
                          src: episodeToPlay.link_m3u8,
                          type: 'application/x-mpegURL'
                        }
                      ]
                    }}
                    subtitles1={subtitles1}
                    subtitles2={subtitles2}
                  />
                ) : (
                  <div className='absolute top-0 left-0 w-full h-full'>
                    {iframeLoading && (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/80 z-10'>
                        <span className='text-white text-xs italic opacity-70'>(Đang tải video dự phòng...)</span>
                      </div>
                    )}
                    <iframe
                      src={episodeToPlay.link_embed || useBackup || ''}
                      title={episodeToPlay.name}
                      allowFullScreen
                      onLoad={() => setIframeLoading(false)}
                      className='w-full h-full border-none'
                    ></iframe>
                  </div>
                )}

                {/* Overlay auto-play tập tiếp theo */}
                {autoplayCountdown !== null && currentIndex < flatEpisodes.length - 1 && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/75 z-20'>
                    <div className='text-center bg-gray-900/90 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4'>
                      <p className='text-gray-400 text-sm mb-1'>Tập tiếp theo</p>
                      <p className='text-white font-bold text-lg mb-6 line-clamp-1'>
                        {flatEpisodes[currentIndex + 1]?.name}
                      </p>
                      {/* Vòng đếm ngược */}
                      <div className='relative w-20 h-20 mx-auto mb-6'>
                        <svg className='w-20 h-20 -rotate-90' viewBox='0 0 80 80'>
                          <circle cx='40' cy='40' r='34' fill='none' stroke='#374151' strokeWidth='6' />
                          <circle
                            cx='40'
                            cy='40'
                            r='34'
                            fill='none'
                            stroke='#3b82f6'
                            strokeWidth='6'
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - autoplayCountdown / AUTOPLAY_COUNTDOWN)}`}
                            strokeLinecap='round'
                            className='transition-all duration-1000 ease-linear'
                          />
                        </svg>
                        <span className='absolute inset-0 flex items-center justify-center text-white text-2xl font-bold'>
                          {autoplayCountdown}
                        </span>
                      </div>
                      <div className='flex gap-3 justify-center'>
                        <button
                          onClick={() => {
                            const nextEp = flatEpisodes[currentIndex + 1]
                            handleSelectEpisode(nextEp.link_embed, nextEp.link_m3u8, nextEp.name)
                          }}
                          className='px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition cursor-pointer'
                        >
                          Xem ngay
                        </button>
                        <button
                          onClick={() => setAutoplayCountdown(null)}
                          className='px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition cursor-pointer'
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Loading state */
            <div className='flex items-center justify-center h-96 text-xl'>
              {!isAvailable ? (
                <div className='flex items-center'>
                  <svg className='animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Đang tải tập phim...
                </div>
              ) : (
                <div>Phim chưa cập nhật...</div>
              )}
            </div>
          )}
        </div>

        {/* Điều hướng tập */}
        {selectedEpisode && episodeToPlay && (
          <div className='flex justify-between mb-8'>
            <button
              className='px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition duration-300 flex items-center gap-2 shadow-lg disabled:cursor-not-allowed cursor-pointer'
              disabled={currentIndex <= 0}
              onClick={() => {
                const ep = flatEpisodes[currentIndex - 1]
                handleSelectEpisode(ep.link_embed, ep.link_m3u8, ep.name)
              }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
              Tập trước
            </button>
            <button
              className='px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition duration-300 flex items-center gap-2 shadow-lg disabled:cursor-not-allowed cursor-pointer'
              disabled={currentIndex >= flatEpisodes.length - 1}
              onClick={() => {
                const ep = flatEpisodes[currentIndex + 1]
                handleSelectEpisode(ep.link_embed, ep.link_m3u8, ep.name)
              }}
            >
              Tập sau
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        )}

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Thông tin phim tóm tắt */}
          <div className='md:col-span-1'>
            <div className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6'>
              <h3 className='text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3'>Thông tin phim</h3>

              <div className='space-y-3 text-sm text-gray-300'>
                <div className='flex items-center'>
                  <Image
                    unoptimized
                    width={100}
                    height={150}
                    src={movie.poster_url}
                    alt={movie.name}
                    className='w-20 h-auto rounded-lg mr-4'
                  />
                  <div>
                    <div>
                      <span className='font-semibold text-gray-200'>Năm:</span> {movie.year}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-200'>Chất lượng:</span> {movie.quality}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-200'>Ngôn ngữ:</span> {movie.lang}
                    </div>
                  </div>
                </div>

                <p>
                  <span className='font-semibold text-gray-200'>Quốc gia:</span>{' '}
                  {movie.country.map(c => c.name).join(', ')}
                </p>
                <p>
                  <span className='font-semibold text-gray-200'>Thể loại:</span>{' '}
                  {movie.category.map(c => c.name).join(', ')}
                </p>
              </div>

              <div className='mt-4 pt-4 border-t border-gray-700'>
                <p className='text-sm text-gray-300 line-clamp-4'>{movie.content}</p>
                <button className='text-blue-400 text-sm mt-2 hover:text-blue-300'>Xem thêm</button>
              </div>
            </div>
          </div>

          {/* Danh sách tập */}
          <div className='md:col-span-2'>
            <div className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg'>
              <h3 className='text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3'>Danh sách tập</h3>
              {isAvailable ? (
                <div className='italic'>Phim sẽ cập nhật trong thời gian sớm nhất, mong bạn thông cảm! </div>
              ) : (
                data?.episodes && (
                  <EpisodeList
                    episodes={data.episodes}
                    onSelectEpisode={ep => handleSelectEpisode(ep.link_embed, ep.link_m3u8, ep.name)}
                    selectedEpisode={selectedEpisode}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <MovieReview slug={movie.slug} name={movie.name} image={movie.poster_url} />
      </div>
    </div>
  )
}
