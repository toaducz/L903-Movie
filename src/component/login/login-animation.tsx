// component/login/login-animation.js
'use client'
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { useEffect } from 'react'

interface LoginAnimationProps {
  isHigh: boolean
  onToggle: () => void
}

export default function LoginAnimation({ isHigh, onToggle }: LoginAnimationProps) {
  const { rive, RiveComponent } = useRive({
    src: '/riv/frieren.riv',
    animations: ['cloud', 'Timeline 1', 'low'],
    autoplay: true,
    layout: new Layout({ fit: Fit.FitWidth, alignment: Alignment.Center })
  })

  useEffect(() => {
    if (!rive) return
    if (isHigh) {
      rive.stop('low')
      rive.play(['high', 'high_button'])
    } else {
      rive.stop('high')
      rive.play(['low', 'low_button'])
    }
  }, [isHigh, rive])

  return (
    <div
      className={`relative w-full h-full overflow-hidden  ${isHigh ? 'bg-[#80B772]' : 'bg-[#A7E0FF]'}`}
      onClick={onToggle}
    >
      <RiveComponent className='w-full h-full scale-[1.6] translate-y-[17%]' />
    </div>
  )
}
