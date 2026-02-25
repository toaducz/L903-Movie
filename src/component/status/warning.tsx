import error from '@/assets/gif/error.gif'
import Image from 'next/image'

interface WarningProps {
  message?: string
}

const Warning: React.FC<WarningProps> = ({ message }) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-900'>
      <Image unoptimized src={error} alt='Error...' width={300} height={300} className='object-contain' priority />
      <span className='text-lg font-semibold'>?</span>
      {message && <span className='text-2xl font-bold text-center'>{message}</span>}
    </div>
  )
}

export default Warning
