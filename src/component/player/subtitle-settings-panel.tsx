'use client'

import { SubtitleSettings } from '@/types/subtitle'

const COLOR_PRESETS = [
  { label: 'Trắng',  value: '#ffffff' },
  { label: 'Vàng',   value: '#fde047' },
  { label: 'Xanh lá',value: '#86efac' },
  { label: 'Xanh dương', value: '#67e8f9' },
  { label: 'Cam',    value: '#fb923c' },
  { label: 'Hồng',   value: '#f9a8d4' }
]

const BG_PRESETS = [
  { label: 'Không nền',  value: 'transparent' },
  { label: 'Mờ',         value: 'rgba(0,0,0,0.5)' },
  { label: 'Đặc',        value: 'rgba(0,0,0,0.85)' }
]

interface Props {
  settings: SubtitleSettings
  onChange: (s: SubtitleSettings) => void
  compact?: boolean // true = dùng trong player (nền tối, nhỏ gọn)
}

export default function SubtitleSettingsPanel({ settings, onChange, compact = false }: Props) {
  const base = compact
    ? 'text-xs text-white'
    : 'text-sm text-gray-200'

  const label = compact
    ? 'text-gray-400 mb-1 block'
    : 'text-gray-400 text-xs mb-1 block font-medium'

  const section = compact ? 'mb-3' : 'mb-5'

  return (
    <div className={base}>
      {/* Vị trí (Y) */}
      <div className={section}>
        <span className={label}>Vị trí (từ dưới lên): {settings.bottomOffset}%</span>
        <input
          type='range' min={3} max={70} step={1}
          value={settings.bottomOffset}
          onChange={e => onChange({ ...settings, bottomOffset: Number(e.target.value) })}
          className='w-full accent-yellow-400 cursor-pointer'
        />
      </div>

      {/* Màu Sub 1 */}
      <div className={section}>
        <span className={label}>Màu Phụ đề 1</span>
        <div className='flex gap-2 flex-wrap'>
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onChange({ ...settings, sub1Color: c.value })}
              className='w-6 h-6 rounded-full border-2 transition-transform hover:scale-110'
              style={{
                backgroundColor: c.value,
                borderColor: settings.sub1Color === c.value ? '#facc15' : 'transparent'
              }}
            />
          ))}
          {/* Custom color picker */}
          <input
            type='color'
            value={settings.sub1Color}
            onChange={e => onChange({ ...settings, sub1Color: e.target.value })}
            className='w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0'
            title='Chọn màu tuỳ chỉnh'
          />
        </div>
      </div>

      {/* Màu Sub 2 */}
      <div className={section}>
        <span className={label}>Màu Phụ đề 2</span>
        <div className='flex gap-2 flex-wrap'>
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onChange({ ...settings, sub2Color: c.value })}
              className='w-6 h-6 rounded-full border-2 transition-transform hover:scale-110'
              style={{
                backgroundColor: c.value,
                borderColor: settings.sub2Color === c.value ? '#facc15' : 'transparent'
              }}
            />
          ))}
          <input
            type='color'
            value={settings.sub2Color}
            onChange={e => onChange({ ...settings, sub2Color: e.target.value })}
            className='w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0'
            title='Chọn màu tuỳ chỉnh'
          />
        </div>
      </div>

      {/* Nền */}
      <div className={section}>
        <span className={label}>Nền phụ đề</span>
        <div className='flex gap-2'>
          {BG_PRESETS.map(b => (
            <button
              key={b.value}
              onClick={() => onChange({ ...settings, bgColor: b.value })}
              className='px-2 py-0.5 rounded text-xs border transition-colors'
              style={{
                borderColor: settings.bgColor === b.value ? '#facc15' : '#4b5563',
                color: settings.bgColor === b.value ? '#facc15' : '#9ca3af'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className='mt-1 flex justify-center'>
        <div
          className='px-3 py-1 rounded text-center max-w-xs'
          style={{ backgroundColor: settings.bgColor === 'transparent' ? 'rgba(0,0,0,0.3)' : settings.bgColor }}
        >
          <p className='text-base font-semibold' style={{ color: settings.sub1Color, textShadow: '0 1px 3px #000' }}>
            Phụ đề 1 — Preview
          </p>
          <p className='text-sm' style={{ color: settings.sub2Color, textShadow: '0 1px 3px #000' }}>
            Phụ đề 2 — Subtitle Two
          </p>
        </div>
      </div>
    </div>
  )
}
