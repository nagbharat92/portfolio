import { useMemo } from "react"
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
 * Hand-drawn selectable tiles for the Folder Lab:
 *   - RoughSwatches — the accent wheel (index -1 = default ink).
 *   - RoughPatterns — a preview of each roughjs fill pattern.
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
  { name: "Amber", color: "var(--accent-amber)" },
  { name: "Yellow", color: "var(--accent-yellow-wheel)" },
  { name: "Citron", color: "var(--accent-citron)" },
  { name: "Green", color: "var(--accent-green-wheel)" },
  { name: "Teal", color: "var(--accent-teal)" },
  { name: "Cyan", color: "var(--accent-cyan)" },
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

interface RoughSwatchesProps {
  /** Selected swatch index; -1 = default ink. */
  value: number
  onChange: (index: number) => void
}

export function RoughSwatches({ value, onChange }: RoughSwatchesProps) {
  const inkPaths = useMemo(
    () =>
      roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
        fill: "none",
        stroke: "currentColor",
        ...ROUGH_OPTIONS,
        seed: 39,
      }),
    [],
  )
  const swatchPaths = useMemo(
    () =>
      SWATCHES.map((s, i) =>
        roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: s.color,
          fillStyle: "solid",
          stroke: "currentColor",
          ...ROUGH_OPTIONS,
          seed: 40 + i,
        }),
      ),
    [],
  )

  return (
    <div role="radiogroup" aria-label="Folder colour" className="flex flex-wrap gap-2">
      <Tile paths={inkPaths} selected={value === -1} label="Default ink" onClick={() => onChange(-1)} />
      {SWATCHES.map((s, i) => (
        <Tile
          key={s.name}
          paths={swatchPaths[i]}
          selected={value === i}
          label={s.name}
          onClick={() => onChange(i)}
        />
      ))}
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
    <div role="radiogroup" aria-label="Fill pattern" className="flex flex-wrap gap-2">
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
    </div>
  )
}
