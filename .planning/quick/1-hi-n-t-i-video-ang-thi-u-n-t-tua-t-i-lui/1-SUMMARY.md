---
phase: quick-1
plan: 1
subsystem: player
tags: [video-player, hls, ux, controls]
dependency_graph:
  requires: []
  provides: [skip-backward-10s, skip-forward-10s, playback-speed-selector]
  affects: [src/component/player/custom-player.tsx]
tech_stack:
  added: []
  patterns: [useCallback for video DOM manipulation, useEffect click-outside pattern]
key_files:
  modified:
    - src/component/player/custom-player.tsx
decisions:
  - Speed menu placed as its own flex item between volume group and fullscreen (not inside left group) to avoid crowding
  - Click-outside handled via document event listener in useEffect gated on showSpeedMenu to avoid always-attached listener
metrics:
  duration: ~5m
  completed: 2026-03-08
---

# Quick-1 Plan 1: Add Skip ±10s and Playback Speed Controls Summary

**One-liner:** Added skip backward/forward ±10s buttons and a 0.5x–2x playback speed dropdown to the HLS custom player control bar.

## What Was Done

Single task: Updated `src/component/player/custom-player.tsx` to add three new controls to the existing control bar.

### New State

- `playbackSpeed: number` — tracks current playback rate (default `1`)
- `showSpeedMenu: boolean` — toggles speed dropdown visibility

### New Handlers

- `skipBackward()` — sets `video.currentTime = Math.max(0, currentTime - 10)`
- `skipForward()` — sets `video.currentTime = Math.min(duration, currentTime + 10)`
- `changeSpeed(speed)` — sets `video.playbackRate`, updates state, closes menu
- `useEffect` (click-outside) — closes speed menu when user clicks outside

### Control Bar Layout (after change)

Left group: [Play/Pause] [Rewind 10s] [Forward 10s] [Mute] [VolumeSlider]
Center: [SpeedButton (e.g. "1x")]
Right: [Fullscreen]

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

- [x] `src/component/player/custom-player.tsx` modified and committed
- [x] Commit `3c34cf1` exists
- [x] TypeScript check: zero errors in custom-player.tsx (pre-existing errors in other files are unrelated missing assets)
- [x] Build environment issue (missing `server-external-packages.jsonc`) is pre-existing, not caused by this change

## Self-Check: PASSED
