'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getDetailMovie } from '@/api/getDetailMovie'
import EpisodeList from '@/component/episode-list'
import ReactPlayer from 'react-player'
import Loading from '@/component/status/loading'
import Error from '@/component/status/error'
import Image from 'next/image'

export default function WatchPage() {
  const { slug } = useParams()
  const { data, isLoading, isError } = useQuery(getDetailMovie({ slug: String(slug) }))
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)

  // Đặt lại selectedEpisode khi slug thay đổi
  useEffect(() => {
    setSelectedEpisode(null)
    setIsWatching(false) // Quay về giao diện thông tin khi đổi phim
  }, [slug])

  // Tự động chọn tập 1 khi data được tải và đang ở chế độ xem phim
  useEffect(() => {
    if (isWatching && data?.episodes?.[0]?.server_data?.[0] && !selectedEpisode) {
      setSelectedEpisode(data.episodes[0].server_data[0].link_m3u8)
    }
  }, [data, selectedEpisode, isWatching])

  if (isLoading) return <Loading />
  if (isError || !data) return <Error />

  const flatEpisodes = data.episodes.flatMap(server => server.server_data)
  const currentIndex = flatEpisodes.findIndex(ep => ep.link_m3u8 === selectedEpisode)
  const episodeToPlay = flatEpisodes[currentIndex]
  const movie = data.movie

  const handleSelectEpisode = (ep: string) => {
    setSelectedEpisode(ep)
  }

  // Giao diện thông tin phim
  if (!isWatching) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8 text-white pt-30'>
        <div className='md:flex gap-6'>
          {/* Poster */}
          <div className='md:w-1/3'>
            <Image
              unoptimized
              priority
              width={200}
              height={200}
              src={movie.poster_url}
              alt={movie.name}
              className='w-full rounded-lg shadow-lg'
            />
          </div>
          {/* Thông tin phim */}
          <div className='md:w-2/3 mt-4 md:mt-0'>
            <h1 className='text-4xl font-bold'>{movie.name}</h1>
            <p className='text-lg text-gray-400 italic'>{movie.origin_name}</p>
            <div className='mt-4'>
              <p className='text-sm'>
                <strong>Đánh giá:</strong> {movie.tmdb?.vote_average?.toFixed(1)}/10 ({movie.tmdb?.vote_count} lượt)
              </p>
              <p className='text-sm'>
                <strong>Năm:</strong> {movie.year} · <strong>Chất lượng:</strong> {movie.quality}
              </p>
              <p className='text-sm'>
                <strong>Ngôn ngữ:</strong> {movie.lang}
              </p>
              <p className='text-sm'>
                <strong>Quốc gia:</strong> {movie.country.map(c => c.name).join(', ')}
              </p>
              <p className='text-sm'>
                <strong>Thể loại:</strong> {movie.category.map(c => c.name).join(', ')}
              </p>
              <p className='text-sm'>
                <strong>Diễn viên:</strong> {movie.actor.join(', ')}
              </p>
              <p className='text-sm'>
                <strong>Đạo diễn:</strong> {movie.director.join(', ')}
              </p>
              <p className='text-sm'>
                <strong>Thời lượng:</strong> {movie.time} · <strong>Tập:</strong> {movie.episode_current}
              </p>
            </div>
            <p className='mt-4 text-gray-300'>{movie.content}</p>
            <button
              className='mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold'
              onClick={() => {
                setIsWatching(true)
                const firstEp = data?.episodes?.[0]?.server_data?.[0]
                if (firstEp) handleSelectEpisode(firstEp.link_m3u8)
              }}
            >
              Xem phim
            </button>
          </div>
        </div>
        {/* Trailer */}
        {movie.trailer_url && (
          <div className='mt-8'>
            <h2 className='text-2xl font-bold mb-2'>Trailer</h2>
            <ReactPlayer url={movie.trailer_url} controls width='100%' height='400px' />
          </div>
        )}
      </div>
    )
  }

  // Giao diện phát video (tương tự WatchPage hiện tại)
  return (
    <div className='max-w-6xl mx-auto px-4 py-8 text-white pt-25'>
      <button className='mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600' onClick={() => setIsWatching(false)}>
        ← Quay lại thông tin phim
      </button>
      <h1 className='text-3xl font-bold mb-2'>{movie.name}</h1>
      <p className='text-sm text-gray-400 italic mb-4'>{movie.origin_name}</p>

      {/* Player hoặc Error */}
      {selectedEpisode && episodeToPlay ? (
        <div className='mb-6'>
          <h2 className='text-xl mb-2'>{episodeToPlay.name}</h2>
          <ReactPlayer
            url={selectedEpisode}
            controls
            width='100%'
            height='500px'
            //
            onError={e => console.error('ReactPlayer error:', e)}
            key={selectedEpisode}
          />
        </div>
      ) : (
        <div className='mb-6 text-red-500'>Đang tải tập phim...</div>
      )}
      {selectedEpisode && episodeToPlay && (
        <div className='flex justify-between mt-4 mb-6'>
          <button
            className='px-4 py-2 bg-gray-700 rounded disabled:opacity-50'
            disabled={currentIndex <= 0}
            onClick={() => setSelectedEpisode(flatEpisodes[currentIndex - 1].link_m3u8)}
          >
            ⬅ Tập trước
          </button>
          <button
            className='px-4 py-2 bg-gray-700 rounded disabled:opacity-50'
            disabled={currentIndex >= flatEpisodes.length - 1}
            onClick={() => setSelectedEpisode(flatEpisodes[currentIndex + 1].link_m3u8)}
          >
            Tập sau ➡
          </button>
        </div>
      )}

      {/* Info */}
      <div className='md:flex gap-6 mb-6'>
        <div>
          <div className='mb-2'>
            <strong>Năm:</strong> {movie.year} · <strong>Chất lượng:</strong> {movie.quality}
          </div>
          <div className='mb-2'>
            <strong>Ngôn ngữ:</strong> {movie.lang}
          </div>
          <div className='mb-2'>
            <strong>Quốc gia:</strong> {movie.country.map(c => c.name).join(', ')}
          </div>
          <div className='mb-2'>
            <strong>Thể loại:</strong> {movie.category.map(c => c.name).join(', ')}
          </div>
          <p className='mt-4 text-sm text-gray-300'>{movie.content}</p>
        </div>
      </div>

      {/* Episodes list */}
      {data?.episodes && (
        <EpisodeList
          episodes={data.episodes}
          onSelectEpisode={ep => handleSelectEpisode(ep.link_m3u8)}
          selectedEpisode={selectedEpisode}
        />
      )}
    </div>
  )
}
