import { useLayoutEffect, useMemo, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "@/lib/utils"

/**
 * Hand-drawn ink primitives (roughjs) for the site's sketchy line-art vibe:
 *   - RoughLine — a wobbly divider/rule that fills its container's width (or height).
 *   - RoughBox  — a wobbly rectangle outline that fills its (positioned) container.
 *
 * RESPONSIVE + STABLE:
 *   Unlike a fixed viewBox (which would stretch and distort the strokes), these
 *   measure their element with a ResizeObserver and draw at REAL pixel coordinates,
 *   so the ink keeps a constant weight at any size. The rough path is memoised on
 *   [size, seed, …], so it only regenerates when the element actually resizes — it
 *   never re-roughens on hover, re-render, or theme change (matches RoughFolder).
 *
 * Ink colour is `currentColor`, so callers set it with a text-* class (e.g.
 * `text-border`) and it stays theme-aware. Both are decorative (aria-hidden).
 */

/** Shared roughjs options — calmer than the folders so long rules don't over-wave. */
const LINE_OPTIONS = { roughness: 1, bowing: 0.6, strokeWidth: 1.4 } as const
const BOX_OPTIONS = { roughness: 1.05, bowing: 0.85, strokeWidth: 1.6 } as const

/** Measure an element's content box; updates on resize (ResizeObserver). */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = (w: number, h: number) =>
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    // Sync first measure (before paint) so the ink appears without a flash.
    update(el.clientWidth, el.clientHeight)
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (cr) update(Math.round(cr.width), Math.round(cr.height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}

/** Build a rounded-rectangle SVG path (quadratic corners) for RoughBox radius. */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  return [
    `M ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `L ${x + rr} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `L ${x} ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ")
}

interface RoughLineProps {
  /** horizontal fills width; vertical fills height. */
  orientation?: "horizontal" | "vertical"
  /** Fixed roughjs seed — persists the exact wobble. */
  seed?: number
  /** Merged onto the wrapper (set the ink with a text-* class, size with w-/h-). */
  className?: string
}

/** A hand-drawn divider/rule. Fills its container along the given axis. */
export function RoughLine({ orientation = "horizontal", seed = 21, className }: RoughLineProps) {
  const [ref, { w, h }] = useElementSize<HTMLSpanElement>()

  const paths = useMemo(() => {
    if (w <= 0 || h <= 0) return []
    const generator = rough.generator()
    const pad = 1.5
    const drawable =
      orientation === "horizontal"
        ? generator.line(pad, h / 2, w - pad, h / 2, { ...LINE_OPTIONS, seed })
        : generator.line(w / 2, pad, w / 2, h - pad, { ...LINE_OPTIONS, seed })
    return generator.toPaths(drawable).map((p) => p.d)
  }, [w, h, orientation, seed])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "block",
        orientation === "horizontal" ? "h-1.5 w-full" : "h-full w-1.5",
        className
      )}
    >
      <svg width={w || 0} height={h || 0} className="block overflow-visible">
        <g fill="none" stroke="currentColor" strokeWidth={LINE_OPTIONS.strokeWidth} strokeLinecap="round">
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </span>
  )
}

interface RoughBoxProps {
  /** Fixed roughjs seed — persists the exact wobble. */
  seed?: number
  /** Corner radius in px (0 = sharp). Match the fill's radius for a clean frame. */
  radius?: number
  /** Inset of the outline from the container edge, in px. */
  inset?: number
  /** Merged onto the wrapper (set the ink with a text-* class). */
  className?: string
}

/**
 * A hand-drawn rectangle outline that fills its container. The container MUST be
 * positioned (relative/absolute/fixed) and should have its CSS border removed.
 * Rendered as an absolute, non-interactive overlay so nothing clips the wobble.
 */
export function RoughBox({ seed = 31, radius = 0, inset = 3, className }: RoughBoxProps) {
  const [ref, { w, h }] = useElementSize<HTMLSpanElement>()

  const paths = useMemo(() => {
    if (w <= inset * 2 || h <= inset * 2) return []
    const generator = rough.generator()
    const rw = w - inset * 2
    const rh = h - inset * 2
    const drawable =
      radius > 0
        ? generator.path(roundedRectPath(inset, inset, rw, rh, radius), { ...BOX_OPTIONS, seed })
        : generator.rectangle(inset, inset, rw, rh, { ...BOX_OPTIONS, seed })
    return generator.toPaths(drawable).map((p) => p.d)
  }, [w, h, seed, radius, inset])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 block", className)}
    >
      <svg width={w || 0} height={h || 0} className="block overflow-visible">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={BOX_OPTIONS.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </span>
  )
}
