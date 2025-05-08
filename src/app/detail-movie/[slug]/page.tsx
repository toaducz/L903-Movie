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
import thumbnail from '@/assets/gumaKe.png'

export default function WatchPage() {
  const { slug } = useParams()
  const { data, isLoading, isError } = useQuery(getDetailMovie({ slug: String(slug) }))
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const isAvailable = data?.movie?.episode_current === "Trailer"

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header với backdrop */}
          <div
            className="relative w-full h-80 rounded-xl mb-8 overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.poster_url})`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{movie.name}</h1>
              <p className="text-xl text-gray-300 italic drop-shadow-md">{movie.origin_name}</p>
            </div>
          </div>

          <div className="md:flex gap-8">
            {/* Poster */}
            <div className="md:w-1/3 flex flex-col">
              <div className="rounded-xl overflow-hidden shadow-2xl transform transition hover:scale-[1.02] duration-300">
                <Image
                  unoptimized
                  priority
                  width={400}
                  height={600}
                  src={movie.poster_url}
                  alt={movie.name}
                  className="w-full h-auto"
                />
              </div>

              <button
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/50 w-full flex justify-center items-center gap-2"
                onClick={() => {
                  setIsWatching(true)
                  const firstEp = data?.episodes?.[0]?.server_data?.[0]
                  if (firstEp) handleSelectEpisode(firstEp.link_m3u8)
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Xem phim
              </button>

              <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  {/* <div className="bg-yellow-500 text-black font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg">
                    {movie.tmdb?.vote_average?.toFixed(1)}
                  </div> */}
                  {/* <div className="ml-4">
                    <p className="text-sm text-gray-300">Đánh giá từ</p>
                    <p className="text-sm font-semibold">{movie.tmdb?.vote_count} người</p>
                  </div> */}
                </div>

                <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm text-gray-300">
                  <div><span className="font-semibold text-gray-200">Năm:</span> {movie.year}</div>
                  <div><span className="font-semibold text-gray-200">Chất lượng:</span> {movie.quality}</div>
                  <div><span className="font-semibold text-gray-200">Ngôn ngữ:</span> {movie.lang}</div>
                  <div><span className="font-semibold text-gray-200">Thời lượng:</span> {movie.time}</div>
                </div>
              </div>
            </div>

            {/* Thông tin phim */}
            <div className="md:w-2/3 mt-6 md:mt-0">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-4">Thông tin chi tiết</h2>

                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="inline-block w-28 font-semibold text-gray-200">Quốc gia:</span>
                    {movie.country.map(c => c.name).join(', ')}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold text-gray-200">Thể loại:</span>
                    {movie.category.map(c => c.name).join(', ')}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold text-gray-200">Diễn viên:</span>
                    {movie.actor.join(', ')}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold text-gray-200">Đạo diễn:</span>
                    {movie.director.join(', ')}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold text-gray-200">Tập hiện tại:</span>
                    {movie.episode_current}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-4">Nội dung</h2>
                <p className="text-gray-300 leading-relaxed">{movie.content}</p>
              </div>

              {/* Thể loại tags */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">Thể loại:</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.category.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-sm"
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
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-500 pl-4">Trailer</h2>
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <ReactPlayer
                  url={movie.trailer_url}
                  controls
                  width="100%"
                  height="500px"
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1 }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Giao diện phát video
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <button
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition duration-300 flex items-center gap-2 shadow-lg"
          onClick={() => setIsWatching(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Quay lại thông tin phim
        </button>

        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">{movie.name}</h1>
          <span className="text-gray-400 italic">{movie.origin_name}</span>
        </div>

        {/* Player trong card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl mb-8">
          {selectedEpisode && episodeToPlay ? (
            <div>
              <div className="bg-gray-700 p-4">
                <h2 className="text-xl font-semibold">{episodeToPlay.name}</h2>
              </div>
              <ReactPlayer
                url={selectedEpisode}
                controls
                width="100%"
                height="600px"
                onError={e => console.error('ReactPlayer error:', e)}
                key={selectedEpisode}
                config={{
                  file: {
                    forceHLS: true,
                  }
                }}
                className="w-full"
                playing
                light={thumbnail.src}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-xl">
              {!isAvailable ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải tập phim...
              </div>) : (<div>Phim chưa cập nhật...</div>)}
            </div>
          )}
        </div>

        {/* Điều hướng tập */}
        {selectedEpisode && episodeToPlay && (
          <div className="flex justify-between mb-8">
            <button
              className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition duration-300 flex items-center gap-2 shadow-lg disabled:cursor-not-allowed"
              disabled={currentIndex <= 0}
              onClick={() => setSelectedEpisode(flatEpisodes[currentIndex - 1].link_m3u8)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tập trước
            </button>
            <button
              className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 transition duration-300 flex items-center gap-2 shadow-lg disabled:cursor-not-allowed"
              disabled={currentIndex >= flatEpisodes.length - 1}
              onClick={() => setSelectedEpisode(flatEpisodes[currentIndex + 1].link_m3u8)}
            >
              Tập sau
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Thông tin phim tóm tắt */}
          <div className="md:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
              <h3 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3">Thông tin phim</h3>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center">
                  <Image
                    unoptimized
                    width={100}
                    height={150}
                    src={movie.poster_url}
                    alt={movie.name}
                    className="w-20 h-auto rounded-lg mr-4"
                  />
                  <div>
                    <div><span className="font-semibold text-gray-200">Năm:</span> {movie.year}</div>
                    <div><span className="font-semibold text-gray-200">Chất lượng:</span> {movie.quality}</div>
                    <div><span className="font-semibold text-gray-200">Ngôn ngữ:</span> {movie.lang}</div>
                  </div>
                </div>

                <p>
                  <span className="font-semibold text-gray-200">Quốc gia:</span> {movie.country.map(c => c.name).join(', ')}
                </p>
                <p>
                  <span className="font-semibold text-gray-200">Thể loại:</span> {movie.category.map(c => c.name).join(', ')}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300 line-clamp-4">{movie.content}</p>
                <button className="text-blue-400 text-sm mt-2 hover:text-blue-300">Xem thêm</button>
              </div>
            </div>
          </div>

          {/* Danh sách tập */}
          <div className="md:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3">Danh sách tập</h3>
              {isAvailable ? (
                <div className='italic'>Phim sẽ cập nhật trong thời gian sớm nhất, mong bạn thông cảm! </div>
              ) : (
                data?.episodes && (
                  <EpisodeList
                    episodes={data.episodes}
                    onSelectEpisode={(ep) => handleSelectEpisode(ep.link_m3u8)}
                    selectedEpisode={selectedEpisode}
                  />
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}