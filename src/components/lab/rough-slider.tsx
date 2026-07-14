import { useLayoutEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import { STROKE_WIDTH, circlePaths, linePaths } from "@/components/lab/rough"

interface RoughSliderProps {
  /** Control label, shown top-left and used as the accessible name. */
  label: string
  value: number
  min: number
  max: number
  /** Increment for drag-snapping and keyboard steps. */
  step?: number
  onChange: (value: number) => void
  /** Formats the numeric value for the top-right readout. */
  format?: (value: number) => string
  /** Fixed roughjs seed so the sketch stays stable. */
  seed?: number
}

const HEIGHT = 40
const CY = HEIGHT / 2
const PAD = 16 // track inset — keeps the thumb clear of the ends
const TRACK_X1 = PAD
const THUMB_R = 9

/** Measure an element's width, updating on resize so the track fills its cell. */
function useTrackWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const set = (x: number) => setW((prev) => (prev === x ? prev : x))
    set(Math.round(el.clientWidth))
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (cr) set(Math.round(cr.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * RoughSlider — a hand-drawn slider for the Folder Lab, matching the folder's
 * squiggly ink (see src/components/lab/rough.ts). Track, thumb and focus ring
 * are drawn once from a fixed seed; the thumb is only translated as the value
 * changes, so nothing re-wobbles.
 *
 * It's a custom control (not a native <input type="range">) so the drawn thumb
 * tracks the pointer exactly. Accessibility is provided via role="slider" +
 * aria-value* and full keyboard support (arrows / page / home / end).
 */
export function RoughSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  seed = 200,
}: RoughSliderProps) {
  const [trackRef, w] = useTrackWidth<HTMLDivElement>()
  const [dragging, setDragging] = useState(false)
  const [focused, setFocused] = useState(false)

  const trackX2 = Math.max(TRACK_X1 + 1, w - PAD)
  const track = useMemo(() => linePaths(TRACK_X1, CY, trackX2, CY, seed), [seed, trackX2])
  const thumb = useMemo(() => circlePaths(0, 0, THUMB_R * 2, seed + 1), [seed])
  const ring = useMemo(() => circlePaths(0, 0, (THUMB_R + 4) * 2, seed + 2), [seed])

  const snap = (n: number) => {
    const stepped = Math.round((n - min) / step) * step + min
    return parseFloat(clamp(stepped, min, max).toFixed(4))
  }

  const fraction = (value - min) / (max - min)
  const thumbX = TRACK_X1 + fraction * (trackX2 - TRACK_X1)

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const frac = clamp((clientX - rect.left - TRACK_X1) / (trackX2 - TRACK_X1), 0, 1)
    onChange(snap(min + frac * (max - min)))
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(true)
    setFromClientX(e.clientX)
    // Pointer capture keeps a drag tracking when the pointer leaves the control.
    // Best-effort: some (synthetic) events lack a valid pointer id, so a failed
    // capture must never abort the value update above.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* capture unsupported for this pointer — dragging still works while over it */
    }
  }
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX)
  }
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* no capture to release */
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step
        break
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step
        break
      case "PageUp":
        next = value + step * 10
        break
      case "PageDown":
        next = value - step * 10
        break
      case "Home":
        next = min
        break
      case "End":
        next = max
        break
      default:
        return
    }
    e.preventDefault()
    onChange(snap(next))
  }

  const active = dragging || focused

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {format ? format(value) : value}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format ? format(value) : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`relative touch-none select-none outline-none ${
          dragging ? "cursor-grabbing" : "cursor-pointer"
        }`}
      >
        <svg
          aria-hidden="true"
          width={w || 0}
          height={HEIGHT}
          viewBox={`0 0 ${w || 1} ${HEIGHT}`}
          className="block overflow-visible text-foreground"
        >
          {/* Track */}
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            className="text-muted-foreground"
          >
            {track.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* Thumb (drawn at origin, moved along the track) */}
          <g transform={`translate(${thumbX} ${CY})`}>
            {/* Focus / drag ring */}
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
              className={`transition-opacity duration-150 ${active ? "opacity-40" : "opacity-0"}`}
            >
              {ring.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            {/* Solid knob fill masks the track passing behind it */}
            <circle r={THUMB_R} style={{ fill: "var(--color-background)" }} />
            <g fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} strokeLinecap="round">
              {thumb.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
