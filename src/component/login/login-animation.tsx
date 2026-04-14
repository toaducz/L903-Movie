'use client'
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { useEffect, memo, useMemo } from 'react'

interface LoginAnimationProps {
  isHigh: boolean
  onToggle: () => void
}

const LoginAnimation = memo(function LoginAnimation({ isHigh, onToggle }: LoginAnimationProps) {
  // Cố định Layout để không bị reset Rive khi component re-render
  const layout = useMemo(
    () =>
      new Layout({
        fit: Fit.FitWidth,
        alignment: Alignment.Center
      }),
    []
  )

  // Cố định mảng animations để tránh hook useRive nhận diện là tham chiếu mới
  const animations = useMemo(() => ['cloud', 'Timeline 1', 'low'], [])

  const { rive, RiveComponent } = useRive({
    src: '/riv/frieren.riv',
    animations: animations,
    autoplay: true,
    layout: layout
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
      className={`relative w-full h-full overflow-hidden cursor-pointer ${isHigh ? 'bg-[#80B772]' : 'bg-[#A7E0FF]'}`}
      onClick={onToggle}
    >
      <RiveComponent className='w-full h-full scale-[1.6] translate-y-[17%]' />
    </div>
  )
})

export default LoginAnimation
