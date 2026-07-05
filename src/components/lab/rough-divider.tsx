import { useMemo } from "react"
import { LAB_WIDTH, STROKE_WIDTH, linePaths } from "@/components/lab/rough"

const HEIGHT = 24

/**
 * RoughDivider — a hand-drawn horizontal rule for the Folder Lab.
 *
 * Same squiggly ink as the folder, drawn once from a fixed seed. Purely
 * decorative (aria-hidden). Rendered in the muted-foreground tone so it reads as
 * a separator rather than primary content.
 */
export function RoughDivider({ seed = 101 }: { seed?: number }) {
  const paths = useMemo(
    () => linePaths(8, HEIGHT / 2, LAB_WIDTH - 8, HEIGHT / 2, seed),
    [seed],
  )

  return (
    <svg
      aria-hidden="true"
      width={LAB_WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${LAB_WIDTH} ${HEIGHT}`}
      className="block overflow-visible text-muted-foreground"
    >
      <g fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} strokeLinecap="round">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}
