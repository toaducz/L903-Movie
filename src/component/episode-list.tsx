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
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onSelectEpisode }) => {
  console.log(episodes)

  return (
    <div>
      {episodes.map((server, index) => (
        <div key={index} className='mb-4'>
          <h3 className='text-lg font-bold mb-2'>{server.server_name}</h3>
          <div className='flex flex-wrap gap-2'>
            {server.server_data.map((ep, idx) => (
              <button
                key={idx}
                className='px-3 py-1 bg-blue-500 rounded hover:bg-gray-900 transition'
                onClick={() => onSelectEpisode(ep)}
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
