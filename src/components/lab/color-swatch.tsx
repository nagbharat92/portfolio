import { useMemo, useRef, useState } from "react"
import { ROUGH_OPTIONS, rectPath, roughPathInfos } from "@/components/lab/rough"
import {
  BLOOM_PRESETS,
  DEFAULT_BLOOM,
  bloomPath,
  bloomSeed,
  randomBloomIndex,
  type BloomShape,
} from "@/lib/bloom"
import type { Swatch } from "@/components/lab/rough-tiles" // type-only ⇒ no runtime cycle
import { cn } from "@/lib/utils"

/**
 * SITE-WIDE COLOUR-SWATCH FRAMEWORK.
 *
 * The SELECTED swatch blooms into a hand-drawn flower (in its own colour) and
 * spins slowly and endlessly; unselected swatches are plain rough squares. This
 * is the one active-state for every colour picker on the site.
 *
 *   • <ColorPicker>  — the batteries-included picker. Give it `swatches` +
 *                      `value`/`onChange` and the bloom comes FREE (each pick
 *                      rolls a fresh, non-repeating bloom). Use this by default.
 *   • <ColorSwatch>  — the single-tile atom, for advanced callers that drive the
 *                      bloom `shape` themselves (e.g. the Bloom lab's sliders).
 *   • <Bloom>        — the standalone flower renderer (e.g. a large preview).
 */

// ── Bloom renderer ────────────────────────────────────────────────────────────

interface BloomProps {
  size: number
  radius: number
  shape: BloomShape
  /** Fill colour, or "none" for an outline-only (theme-ink) bloom. */
  fill: string
  seed: number
  strokeWidth?: number
  centerDot?: boolean
  /** Rotate endlessly — the selection signal. */
  spin?: boolean
  className?: string
}

/** A hand-drawn (roughjs) flower, filled with `fill`, stroked in the theme ink. */
export function Bloom({ size, radius, shape, fill, seed, strokeWidth = 1.4, centerDot = false, spin = false, className }: BloomProps) {
  const paths = useMemo(
    () =>
      roughPathInfos(bloomPath(size / 2, size / 2, radius, shape), {
        fill,
        fillStyle: "solid",
        stroke: "currentColor",
        ...ROUGH_OPTIONS,
        strokeWidth,
        seed,
      }),
    [size, radius, shape, fill, seed, strokeWidth],
  )
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("block overflow-visible text-foreground", spin && "animate-bloom-spin", className)}
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => (
          <path key={i} d={p.d} stroke={p.stroke} fill={p.fill ?? "none"} strokeWidth={p.strokeWidth} />
        ))}
        {centerDot ? <circle cx={size / 2} cy={size / 2} r={radius * 0.15} fill="currentColor" opacity={0.14} /> : null}
      </g>
    </svg>
  )
}

// ── Single swatch ─────────────────────────────────────────────────────────────

interface ColorSwatchProps {
  /** Fill colour; omit for the theme-ink "default" swatch (outline only). */
  color?: string
  /** Accessible name + the seed source for the hand-drawn sketch. */
  name: string
  selected: boolean
  /** The bloom shown when selected — drive this to control the flower. */
  shape: BloomShape
  onClick: () => void
  /** Tile size in px (default 34). */
  size?: number
}

/**
 * ColorSwatch — one selectable colour. Unselected: a rough square. Selected:
 * blooms into a spinning flower in its own colour (or theme ink when `color` is
 * omitted). Most callers should use <ColorPicker>; reach for this atom only to
 * drive the bloom `shape` externally.
 */
export function ColorSwatch({ color, name, selected, shape, onClick, size = 34 }: ColorSwatchProps) {
  const seed = bloomSeed(name)
  const inset = Math.max(2, Math.round(size * 0.09))
  const fill = color ?? "none"
  const paths = useMemo(
    () =>
      selected
        ? roughPathInfos(bloomPath(size / 2, size / 2, size * 0.44, shape), {
            fill,
            fillStyle: "solid",
            stroke: "currentColor",
            ...ROUGH_OPTIONS,
            seed,
          })
        : roughPathInfos(rectPath(inset, inset, size - inset * 2, size - inset * 2), {
            fill,
            fillStyle: "solid",
            stroke: "currentColor",
            ...ROUGH_OPTIONS,
            seed,
          }),
    [selected, shape, fill, seed, size, inset],
  )

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={name}
      title={name}
      onClick={onClick}
      className={cn(
        "rounded-md p-0.5 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "scale-110" : "opacity-80 hover:opacity-100",
      )}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("block overflow-visible text-foreground", selected && "animate-bloom-spin")}
      >
        <g strokeLinecap="round" strokeLinejoin="round">
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.stroke} fill={p.fill ?? "none"} strokeWidth={p.strokeWidth} />
          ))}
        </g>
      </svg>
    </button>
  )
}

// ── Batteries-included picker ───────────────────────────────────────────────────

interface ColorPickerProps {
  swatches: Swatch[]
  /** Selected index; -1 = none (or the ink swatch when `ink` is set). */
  value: number
  onChange: (index: number) => void
  /** radiogroup accessible name. */
  label?: string
  /** Grid columns utility (default two rows of six). Pick a count that divides
   *  the tile count so rows stay full — e.g. a 13-tile wheel uses a 13-col row. */
  cols?: string
  className?: string
  /** Prepend a "default ink" swatch at index -1 (theme-ink outline). */
  ink?: boolean
  inkLabel?: string
  /** Tile size in px. */
  size?: number
}

/**
 * ColorPicker — the DEFAULT colour picker for the whole site. The selected
 * swatch blooms & spins for free; every pick rolls a fresh bloom shape that
 * never repeats the previous one. Fully controlled via `value`/`onChange`.
 */
export function ColorPicker({
  swatches,
  value,
  onChange,
  label = "Colour",
  cols = "grid-cols-6",
  className,
  ink = false,
  inkLabel = "Default ink",
  size,
}: ColorPickerProps) {
  // The active bloom shape — a fresh (non-repeating) preset on every pick. Starts
  // at a fixed default (never randomise during render; that's impure).
  const [shape, setShape] = useState<BloomShape>(DEFAULT_BLOOM)
  const lastRef = useRef(-1)
  const select = (i: number) => {
    const pi = randomBloomIndex(lastRef.current)
    lastRef.current = pi
    setShape(BLOOM_PRESETS[pi])
    onChange(i)
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("grid justify-items-center gap-2", cols, className)}>
      {ink ? <ColorSwatch name={inkLabel} selected={value === -1} shape={shape} onClick={() => select(-1)} size={size} /> : null}
      {swatches.map((s, i) => (
        <ColorSwatch key={s.name} color={s.color} name={s.name} selected={value === i} shape={shape} onClick={() => select(i)} size={size} />
      ))}
    </div>
  )
}
