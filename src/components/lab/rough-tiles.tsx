import { useMemo, type ReactNode } from "react"
import {
  FILL_STYLES,
  ROUGH_OPTIONS,
  rectPath,
  roughPathInfos,
  type FillStyle,
  type RoughPathInfo,
} from "@/components/lab/rough"
import { cn } from "@/lib/utils"

/**
 * Hand-drawn selectable tiles for the labs.
 *   - RoughPatterns — a preview of each roughjs fill pattern.
 *   - SwatchGrid — the shared grid layout for a row of tiles.
 * The COLOUR-SWATCH picker (the selected tile blooms into a spinning flower)
 * lives in the site-wide framework: src/components/lab/color-swatch.tsx.
 * Each tile is a small rough square (squiggly, like everything else in the lab).
 */

const TILE = 30
const INSET = 4
const INNER = TILE - INSET * 2

/** Accent wheel from src/tokens.css — the graphics/illustration palette. One
 *  solid colour per swatch, applied to both leaves. Theme-aware via CSS vars. */
export type Swatch = { name: string; color: string }
export const SWATCHES: Swatch[] = [
  { name: "Rose", color: "var(--accent-rose)" },
  { name: "Coral", color: "var(--accent-coral)" },
  { name: "Orange", color: "var(--accent-orange)" },
  { name: "Amber", color: "var(--accent-amber)" },
  { name: "Yellow", color: "var(--accent-yellow-wheel)" },
  { name: "Citron", color: "var(--accent-citron)" },
  { name: "Green", color: "var(--accent-green-wheel)" },
  { name: "Emerald", color: "var(--accent-emerald)" },
  { name: "Teal", color: "var(--accent-teal)" },
  { name: "Cyan", color: "var(--accent-cyan)" },
  { name: "Azure", color: "var(--accent-azure)" },
  { name: "Blue", color: "var(--accent-blue-wheel)" },
  { name: "Indigo", color: "var(--accent-indigo)" },
  { name: "Violet", color: "var(--accent-violet)" },
  { name: "Magenta", color: "var(--accent-magenta)" },
]

function Tile({
  paths,
  selected,
  label,
  onClick,
}: {
  paths: RoughPathInfo[]
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-0.5 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "scale-110 ring-2 ring-foreground/70" : "opacity-80 hover:opacity-100",
      )}
    >
      <svg
        aria-hidden="true"
        width={TILE}
        height={TILE}
        viewBox={`0 0 ${TILE} ${TILE}`}
        className="block overflow-visible text-foreground"
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

/**
 * SwatchGrid — the shared layout for every hand-drawn swatch/tile row in the
 * labs (folder colour, fill patterns, flower colours, background bases). Lays
 * the fixed-size square tiles in a CSS grid, each square centred in its cell, so
 * a row is always full — no left-hugging orphans. Pick a `cols` count that
 * divides the tile count: 12 tiles → `grid-cols-6` (two rows of six); a 13- or
 * 7-tile wheel → one row. Centralising the rule here keeps the labs from
 * drifting apart.
 *
 * By default the columns STRETCH (`1fr`) so the row fills its card edge-to-edge
 * — right for a snug card like the background rail. Pass `className="w-fit"`
 * when the container is much wider than the tiles (e.g. the flower stage) to
 * keep a tight, start-aligned block instead of a sparse, over-spread row.
 */
export function SwatchGrid({
  label,
  cols,
  className,
  children,
}: {
  label: string
  cols: string
  className?: string
  children: ReactNode
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid justify-items-center gap-2", cols, className)}>
      {children}
    </div>
  )
}

interface RoughPatternsProps {
  /** Selected fill pattern, or "none" for no fill. */
  value: FillStyle | "none"
  onChange: (style: FillStyle | "none") => void
  /** Concrete ink colour to draw the pattern preview with (theme-aware). */
  ink: string
}

export function RoughPatterns({ value, onChange, ink }: RoughPatternsProps) {
  // "No fill" tile — a plain rough square (matches the Default-ink swatch).
  const nonePaths = useMemo(
    () =>
      roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
        fill: "none",
        stroke: "currentColor",
        ...ROUGH_OPTIONS,
        seed: 59,
      }),
    [],
  )
  const tiles = useMemo(
    () =>
      FILL_STYLES.map((style, i) => {
        const outline = roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: "none",
          stroke: "currentColor",
          ...ROUGH_OPTIONS,
          seed: 60 + i,
        })
        const pattern = roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: ink,
          fillStyle: style,
          hachureGap: 3.5,
          fillWeight: 1,
          ...ROUGH_OPTIONS,
          stroke: "none",
          seed: 61 + i,
        })
        return [...pattern, ...outline]
      }),
    [ink],
  )

  return (
    <SwatchGrid label="Fill pattern" cols="grid-cols-7">
      <Tile paths={nonePaths} selected={value === "none"} label="No fill" onClick={() => onChange("none")} />
      {FILL_STYLES.map((style, i) => (
        <Tile
          key={style}
          paths={tiles[i]}
          selected={value === style}
          label={style}
          onClick={() => onChange(style)}
        />
      ))}
    </SwatchGrid>
  )
}
