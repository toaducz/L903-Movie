'use client'

import React from 'react'

type Episode = {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}

type Server = {
  server_name: string
  server_data: Episode[]
}

type EpisodeListProps = {
  episodes: Server[]
  onSelectEpisode: (episode: Episode) => void
  selectedEpisode: string | null // link_nhúng
  // backup?: string // link nhúng
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onSelectEpisode, selectedEpisode }) => {
  const handleSelectEpisode = (episode: Episode) => {
    onSelectEpisode(episode)
  }

  return (
    <div className='mt-4 space-y-6'>
      {episodes.map((server, serverIdx) => (
        <div key={serverIdx}>
          <h2 className='text-lg font-semibold text-white mb-2'>{server.server_name}</h2>
          <div className='flex flex-wrap gap-2'>
            {server.server_data.map((ep, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  selectedEpisode === ep.link_embed ? 'bg-gray-900 text-white' : 'bg-blue-500 hover:bg-gray-900'
                }`}
                onClick={() => handleSelectEpisode(ep)}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default EpisodeList
