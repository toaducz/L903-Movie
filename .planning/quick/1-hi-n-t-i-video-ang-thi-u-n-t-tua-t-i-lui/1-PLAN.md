---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/component/player/custom-player.tsx
autonomous: true
requirements:
  - PLAYER-SEEK
  - PLAYER-SPEED
must_haves:
  truths:
    - "User can skip backward 10 seconds with a button click"
    - "User can skip forward 10 seconds with a button click"
    - "User can change playback speed via a dropdown (0.5x to 2x)"
    - "Selected speed is visually indicated in the control bar"
  artifacts:
    - path: "src/component/player/custom-player.tsx"
      provides: "Skip backward, skip forward, and playback speed controls"
      contains: "skipBackward, skipForward, playbackSpeed, setPlaybackSpeed"
  key_links:
    - from: "skip buttons"
      to: "video.currentTime"
      via: "±10 offset on click"
    - from: "speed selector"
      to: "video.playbackRate"
      via: "setPlaybackRate on option select"
---

<objective>
Add seek skip (±10s) buttons and a playback speed selector to the custom HLS video player.

Purpose: Improve user viewing experience — skipping intro/recap segments and adjusting speed are standard expected controls for a streaming app.
Output: Updated `custom-player.tsx` with skip backward button, skip forward button, and speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x) integrated into the existing control bar.
</objective>

<execution_context>
@C:/Users/HelpDesk.Amazing/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/HelpDesk.Amazing/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/component/player/custom-player.tsx

<interfaces>
<!-- Current player state shape. Executor adds to this, does NOT remove existing state. -->

Existing state:
- isPlaying: boolean
- currentTime: number
- duration: number
- volume: number
- isFullscreen: boolean
- isMuted: boolean
- showControls: boolean

Existing handlers:
- togglePlay()
- handleSeek(e)
- handleVolumeChange(e)
- toggleMute()
- toggleFullscreen()
- formatTime(seconds): string

Control bar layout (bottom bar, left group → right group):
  Left: [Play/Pause] [Mute] [VolumeSlider]
  Right: [Fullscreen]

New controls must fit into this bar layout.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add skip ±10s handlers and playback speed state/handler</name>
  <files>src/component/player/custom-player.tsx</files>
  <action>
Add to state declarations (after existing useState hooks):
```ts
const [playbackSpeed, setPlaybackSpeed] = useState(1)
const [showSpeedMenu, setShowSpeedMenu] = useState(false)
```

Add these handler functions (after `toggleMute`, before `toggleFullscreen`):

```ts
const skipBackward = useCallback(() => {
  const video = videoRef.current
  if (!video) return
  video.currentTime = Math.max(0, video.currentTime - 10)
}, [])

const skipForward = useCallback(() => {
  const video = videoRef.current
  if (!video) return
  video.currentTime = Math.min(video.duration, video.currentTime + 10)
}, [])

const changeSpeed = useCallback((speed: number) => {
  const video = videoRef.current
  if (!video) return
  video.playbackRate = speed
  setPlaybackSpeed(speed)
  setShowSpeedMenu(false)
}, [])
```

In the JSX control bar, insert skip buttons between [Play/Pause] and [Mute]:

```tsx
{/* Skip Backward 10s */}
<button
  onClick={skipBackward}
  className='p-2 hover:bg-white/20 rounded-full transition-colors'
  title='Rewind 10s'
>
  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z'/>
    <text x='8' y='15' fontSize='6' fontWeight='bold' fill='currentColor'>10</text>
  </svg>
</button>

{/* Skip Forward 10s */}
<button
  onClick={skipForward}
  className='p-2 hover:bg-white/20 rounded-full transition-colors'
  title='Forward 10s'
>
  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z'/>
    <text x='8' y='15' fontSize='6' fontWeight='bold' fill='currentColor'>10</text>
  </svg>
</button>
```

In the JSX control bar, insert speed selector between [VolumeSlider] (end of left group) and [Fullscreen] (right group). Place it as a new middle group or left-side addition:

```tsx
{/* Playback Speed */}
<div className='relative'>
  <button
    onClick={() => setShowSpeedMenu(prev => !prev)}
    className='px-2 py-1 text-sm hover:bg-white/20 rounded transition-colors font-medium min-w-[44px]'
    title='Playback speed'
  >
    {playbackSpeed}x
  </button>
  {showSpeedMenu && (
    <div className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/90 rounded shadow-lg overflow-hidden'>
      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
        <button
          key={speed}
          onClick={() => changeSpeed(speed)}
          className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-white/20 transition-colors ${
            playbackSpeed === speed ? 'text-blue-400 font-semibold' : 'text-white'
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  )}
</div>
```

Also close the speed menu when user clicks outside — add to the existing mouseleave handler on container or add a useEffect:

```ts
// Close speed menu on click outside
useEffect(() => {
  const handleClickOutside = () => setShowSpeedMenu(false)
  if (showSpeedMenu) {
    document.addEventListener('click', handleClickOutside)
  }
  return () => document.removeEventListener('click', handleClickOutside)
}, [showSpeedMenu])
```

Stop event propagation on the speed button itself by adding `e.stopPropagation()` in the speed button's onClick:
```tsx
onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(prev => !prev) }}
```

Code style: single quotes, no semicolons, 2-space indent, 120-char line width (matches CLAUDE.md Prettier config).
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    Build passes with no TypeScript errors. Player control bar shows: [Play/Pause] [Rewind10] [Forward10] [Mute] [Volume] ... [SpeedButton] ... [Fullscreen]. Clicking speed button opens a dropdown with 0.5x–2x options. Clicking an option sets video.playbackRate and updates the button label.
  </done>
</task>

</tasks>

<verification>
After task completes:
1. `npm run build` passes with no errors or type warnings related to custom-player.tsx
2. Run `npm run dev` and open a movie episode — confirm the three new controls render in the player bar
3. Click rewind/forward — video.currentTime changes by ±10s
4. Click speed button → dropdown appears → select 1.5x → video plays faster → button shows "1.5x"
</verification>

<success_criteria>
- Skip backward (-10s) button visible and functional
- Skip forward (+10s) button visible and functional
- Playback speed selector shows current speed, dropdown lists 6 options, selected option highlighted in blue
- No regression on existing controls (play/pause, volume, fullscreen, progress bar)
- TypeScript build clean
</success_criteria>

<output>
After completion, create `.planning/quick/1-hi-n-t-i-video-ang-thi-u-n-t-tua-t-i-lui/1-SUMMARY.md` summarizing what was changed.
</output>
