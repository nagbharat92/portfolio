import { useMemo } from "react"
import {
  FILL_STYLES,
  rectPath,
  roughPathInfos,
  type FillStyle,
  type RoughPathInfo,
} from "@/components/lab/rough"
import { cn } from "@/lib/utils"

/**
 * Hand-drawn selectable tiles for the Folder Lab:
 *   - RoughSwatches — pastel Apple-ish colours (index -1 = default ink).
 *   - RoughPatterns — a preview of each roughjs fill pattern.
 * Each tile is a small rough square (squiggly, like everything else in the lab).
 */

const TILE = 30
const INSET = 4
const INNER = TILE - INSET * 2

/** Apple-ish system colours — `back` = a lightly-tinted leaf, `front` = darker shade. */
export type Swatch = { name: string; back: string; front: string }
export const SWATCHES: Swatch[] = [
  { name: "White", back: "#FFFFFF", front: "#C7C7CC" },
  { name: "Red", back: "#EC7F82", front: "#E5484D" },
  { name: "Orange", back: "#EFAA55", front: "#E8850C" },
  { name: "Yellow", back: "#DDBB4D", front: "#CF9E00" },
  { name: "Green", back: "#6DC284", front: "#2FA84F" },
  { name: "Mint", back: "#59C0B4", front: "#12A594" },
  { name: "Teal", back: "#62B6C5", front: "#1F97AC" },
  { name: "Blue", back: "#6D9AE9", front: "#2F6FE0" },
  { name: "Indigo", back: "#8180CD", front: "#4B49B8" },
  { name: "Purple", back: "#B879DB", front: "#9A3FCB" },
  { name: "Pink", back: "#EB81AB", front: "#E24B87" },
  { name: "Brown", back: "#AD9781", front: "#8A6A4B" },
  { name: "Gray", back: "#9A9A9D", front: "#6E6E73" },
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
        roughness: 1.1,
        bowing: 1,
        strokeWidth: 1.3,
        seed: 39,
      }),
    [],
  )
  const swatchPaths = useMemo(
    () =>
      SWATCHES.map((s, i) =>
        roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: s.front,
          fillStyle: "solid",
          stroke: s.front,
          roughness: 1.1,
          bowing: 1,
          strokeWidth: 1.3,
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
  value: FillStyle
  onChange: (style: FillStyle) => void
  /** Concrete ink colour to draw the pattern preview with (theme-aware). */
  ink: string
}

export function RoughPatterns({ value, onChange, ink }: RoughPatternsProps) {
  const tiles = useMemo(
    () =>
      FILL_STYLES.map((style, i) => {
        const outline = roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: "none",
          stroke: "currentColor",
          roughness: 0.9,
          bowing: 0.7,
          strokeWidth: 1.1,
          seed: 60 + i,
        })
        const pattern = roughPathInfos(rectPath(INSET, INSET, INNER, INNER), {
          fill: ink,
          fillStyle: style,
          hachureGap: 3.5,
          fillWeight: 1,
          roughness: 0.9,
          bowing: 0.6,
          stroke: "none",
          seed: 61 + i,
        })
        return [...pattern, ...outline]
      }),
    [ink],
  )

  return (
    <div role="radiogroup" aria-label="Fill pattern" className="flex flex-wrap gap-2">
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
