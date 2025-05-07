'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getDetailMovie } from '@/api/getDetailMovie'
import EpisodeList from '@/component/episode-list'
import ReactPlayer from 'react-player'

export default function WatchPage() {
  const { slug } = useParams()

  const { data, isLoading, error } = useQuery(getDetailMovie({ slug: String(slug) }))
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  if (isLoading) return <div className='text-white p-4'>Đang tải...</div>
  if (error || !data) return <div className='text-red-500 p-4'>Không tìm thấy phim.</div>
  const episodeToPlay = data?.episodes
    .flatMap(server => server.server_data)
    .find(ep => ep.link_m3u8 === selectedEpisode)
  const movie = data.movie
  // const firstEpisode = data.episodes[0]?.server_data[0]

  return (
    <div className='max-w-6xl mx-auto px-4 py-8 text-white'>
      <h1 className='text-3xl font-bold mb-2'>{movie.name}</h1>
      <p className='text-sm text-gray-400 italic mb-4'>{movie.origin_name}</p>

      {/* Player */}
      {selectedEpisode && episodeToPlay && (
        <div className='mb-6'>
          <h2 className='text-xl mb-2'>{episodeToPlay.name}</h2>
          <ReactPlayer url={selectedEpisode} controls width='100%' height='500px' />
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
        <EpisodeList episodes={data.episodes} onSelectEpisode={ep => setSelectedEpisode(ep.link_m3u8)} />
      )}
    </div>
  )
}
