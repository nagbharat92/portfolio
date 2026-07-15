import { useMemo } from "react"
import { STROKE_WIDTH, linePaths } from "@/components/lab/rough"
import { cn } from "@/lib/utils"

/**
 * CornerFrame — four hand-drawn registration brackets ("corner strokes") that
 * frame a container like a viewfinder. Drop it inside any `position: relative`
 * box: it renders as a non-interactive, absolutely-positioned overlay and never
 * affects layout.
 *
 * Ink colour follows `currentColor` (default: a quiet muted ink) — recolour or
 * reposition by passing a `className` (e.g. `text-foreground`, or a different
 * inset than the default `inset-5`). The sketch is deterministic (fixed `seed`),
 * so it never re-wobbles on re-render.
 *
 * Reusable everywhere; the Folder Lab stage and the Type specimen both use it.
 */

// One L-shaped bracket, in each bracket SVG's own px units.
const TICK_BOX = 28 // svg viewport
const TICK_ARM = 16 // length of each bracket arm
const TICK_PAD = 4 // stroke inset within the box (keeps round caps off the edge)

// The top-left bracket, reused at every corner via rotation so all four share
// one deterministic sketch and read as precise, intentional registration marks.
const CORNERS = [
  { pos: "left-5 top-5", rotate: "" }, // top-left
  { pos: "right-5 top-5", rotate: "rotate-90" }, // top-right
  { pos: "right-5 bottom-5", rotate: "rotate-180" }, // bottom-right
  { pos: "left-5 bottom-5", rotate: "-rotate-90" }, // bottom-left
] as const

interface CornerFrameProps {
  /** Fixed roughjs seed — persists the exact wobble across re-renders. */
  seed?: number
  /** Hide the top-right bracket (e.g. to make room for a corner action). */
  hideTopRight?: boolean
  /** Merged onto the overlay — set the ink with a text-* class, or reposition. */
  className?: string
}

export function CornerFrame({ seed = 91, hideTopRight = false, className }: CornerFrameProps) {
  // Two arms of an L meeting at (TICK_PAD, TICK_PAD); drawn once, placed 4×.
  const paths = useMemo(
    () => [
      ...linePaths(TICK_PAD, TICK_PAD, TICK_PAD + TICK_ARM, TICK_PAD, seed), // horizontal arm
      ...linePaths(TICK_PAD, TICK_PAD, TICK_PAD, TICK_PAD + TICK_ARM, seed + 1), // vertical arm
    ],
    [seed],
  )

  // Drop the top-right bracket when a corner action (e.g. Reset) owns that spot.
  const corners = hideTopRight ? CORNERS.filter((c) => c.pos !== "right-5 top-5") : CORNERS

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 text-muted-foreground/70", className)}
    >
      {corners.map((c) => (
        <svg
          key={c.pos}
          aria-hidden="true"
          width={TICK_BOX}
          height={TICK_BOX}
          viewBox={`0 0 ${TICK_BOX} ${TICK_BOX}`}
          className={cn("absolute block overflow-visible", c.pos, c.rotate)}
        >
          <g fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} strokeLinecap="round">
            {paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </svg>
      ))}
    </div>
  )
}
