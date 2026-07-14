import { useMemo } from "react"
import { STROKE_WIDTH, linePaths, rectPath, roughPathInfos } from "@/components/lab/rough"

const SIZE = 22
const INSET = 3

interface RoughCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Fixed roughjs seed so the sketch stays stable. */
  seed?: number
}

/**
 * RoughCheckbox — a hand-drawn checkbox for the Folder Lab. A rough square with a
 * rough tick that fades in when checked. It's a native <button role="checkbox">
 * so Space/Enter and focus come for free; the sketch is drawn once from a seed.
 */
export function RoughCheckbox({ label, checked, onChange, seed = 91 }: RoughCheckboxProps) {
  const box = useMemo(
    () =>
      roughPathInfos(rectPath(INSET, INSET, SIZE - INSET * 2, SIZE - INSET * 2), {
        roughness: 1.1,
        bowing: 1,
        strokeWidth: STROKE_WIDTH,
        seed,
        fill: "none",
      }).map((p) => p.d),
    [seed],
  )
  const tick = useMemo(
    () => [...linePaths(6, 12, 9.5, 16, seed + 1), ...linePaths(9.5, 16, 17, 6, seed + 2)],
    [seed],
  )

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg
        aria-hidden="true"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="block shrink-0 overflow-visible text-foreground"
      >
        <g fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
          {box.map((d, i) => (
            <path key={`b${i}`} d={d} />
          ))}
        </g>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH + 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"}`}
        >
          {tick.map((d, i) => (
            <path key={`t${i}`} d={d} />
          ))}
        </g>
      </svg>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  )
}
