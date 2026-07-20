import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import rough from "roughjs"
import { cn } from "@/lib/utils"
import { INK } from "@/lib/ink"

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
 *   never re-roughens on hover, re-render, or theme change.
 *
 * Ink colour is `currentColor`, so callers set it with a text-* class (e.g.
 * `text-border`) and it stays theme-aware. Both are decorative (aria-hidden).
 */

/** Both rules and boxes draw with the site-wide global ink (see @/lib/ink). */
const LINE_OPTIONS = INK
const BOX_OPTIONS = INK

// ── "Boil" animation ─────────────────────────────────────────────────────────
// When a rule/box opts in via `boil`, its roughjs seed advances on a timer so the
// hand-drawn stroke re-wobbles frame-to-frame (the classic 2-D "boil"). The
// cadence MIRRORS the Motion lab's defaults (motion-lab.tsx DEFAULTS: interval
// 0.2s, 8 looped frames) — hardcoded and kept in sync by hand, matching the folder
// lab's hover boil, to avoid coupling the modules. Default off, so every existing
// RoughLine/RoughBox call site stays perfectly static.
const BOIL_INTERVAL = 0.2 // seconds each seed is held before the next
const BOIL_FRAMES = 8 // number of seeds in the loop

/**
 * While `active`, advances `baseSeed` through BOIL_FRAMES fixed frames on a timer
 * and returns the current seed, so a memoised rough path re-generates each frame.
 * At rest (or under prefers-reduced-motion) it returns `baseSeed` unchanged, so
 * the stroke is static and identical to its un-animated drawing.
 */
function useBoilSeed(baseSeed: number, active: boolean) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    let f = 0
    const id = window.setInterval(() => {
      f = (f + 1) % BOIL_FRAMES
      setFrame(f)
    }, Math.max(60, Math.round(BOIL_INTERVAL * 1000)))
    return () => window.clearInterval(id)
  }, [active])
  return active ? baseSeed + frame : baseSeed
}

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

/** Build a rounded-rectangle SVG path for RoughBox radius.
 *
 * The corners are true circular arcs (cubic béziers using the kappa constant),
 * NOT quadratic béziers. A quadratic corner bulges toward the outer corner, so
 * against a CSS `border-radius` arc the uniform edge gap collapses to nearly
 * zero at the 45° diagonal — the stroke "touches" the background corner. A
 * kappa cubic matches the CSS arc, so a concentric inset stays uniform all the
 * way around the corner. */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  const k = rr * 0.5522847498 // control-point offset for a circular-arc cubic bézier
  return [
    `M ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `C ${x + w - rr + k} ${y} ${x + w} ${y + rr - k} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h - rr}`,
    `C ${x + w} ${y + h - rr + k} ${x + w - rr + k} ${y + h} ${x + w - rr} ${y + h}`,
    `L ${x + rr} ${y + h}`,
    `C ${x + rr - k} ${y + h} ${x} ${y + h - rr + k} ${x} ${y + h - rr}`,
    `L ${x} ${y + rr}`,
    `C ${x} ${y + rr - k} ${x + rr - k} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ")
}

interface RoughLineProps {
  /** horizontal fills width; vertical fills height. */
  orientation?: "horizontal" | "vertical"
  /** Fixed roughjs seed — persists the exact wobble. */
  seed?: number
  /** When true, animate the seed so the stroke "boils" (see useBoilSeed). */
  boil?: boolean
  /** Override the global ink bowing (roughjs curviness). Defaults to INK. */
  bowing?: number
  /** Merged onto the wrapper (set the ink with a text-* class, size with w-/h-). */
  className?: string
}

/** A hand-drawn divider/rule. Fills its container along the given axis. */
export function RoughLine({ orientation = "horizontal", seed = 21, boil = false, bowing, className }: RoughLineProps) {
  const [ref, { w, h }] = useElementSize<HTMLSpanElement>()
  const animSeed = useBoilSeed(seed, boil)

  const paths = useMemo(() => {
    if (w <= 0 || h <= 0) return []
    const generator = rough.generator()
    const pad = 1.5
    const opts = { ...LINE_OPTIONS, seed: animSeed, bowing: bowing ?? LINE_OPTIONS.bowing }
    const drawable =
      orientation === "horizontal"
        ? generator.line(pad, h / 2, w - pad, h / 2, opts)
        : generator.line(w / 2, pad, w / 2, h - pad, opts)
    return generator.toPaths(drawable).map((p) => p.d)
  }, [w, h, orientation, animSeed, bowing])

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
  /** Override the auto-detected container radius, in px. Normally OMIT this —
   *  RoughBox reads the framed element's real border-radius (its positioned
   *  parent, or the sibling it overlays) and draws the outline `inset` inside,
   *  so the hand-drawn corner stays concentric with the card's rounded corner. */
  radius?: number
  /** Inset of the outline from the container edge, in px. */
  inset?: number
  /** When true, animate the seed so the outline "boils" (see useBoilSeed). */
  boil?: boolean
  /** Override the global ink bowing (roughjs curviness). Defaults to INK. */
  bowing?: number
  /** Merged onto the wrapper (set the ink with a text-* class). */
  className?: string
}

/**
 * A hand-drawn rectangle outline that fills its container. The container MUST be
 * positioned (relative/absolute/fixed) and should have its CSS border removed.
 * Rendered as an absolute, non-interactive overlay so nothing clips the wobble.
 */
export function RoughBox({ seed = 31, radius, inset = 3, boil = false, bowing, className }: RoughBoxProps) {
  const [ref, { w, h }] = useElementSize<HTMLSpanElement>()
  const [autoRadius, setAutoRadius] = useState(0)
  const animSeed = useBoilSeed(seed, boil)

  // Detect the framed element's real corner radius so the ink matches whatever
  // the theme's rounded-* scale renders to. The framed element is the positioned
  // parent (child pattern) or, when the parent is a bare wrapper, the sibling the
  // outline overlays (used with overflow-hidden fills). useLayoutEffect reads it
  // before paint, so there's no sharp-corner flash.
  useLayoutEffect(() => {
    if (radius !== undefined) return
    const el = ref.current
    if (!el) return
    const read = (node: Element | null | undefined) =>
      node ? parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0 : 0
    // Wrapped in a helper (not a direct setState in the effect body) to satisfy
    // react-hooks/set-state-in-effect, mirroring useElementSize above.
    const apply = (r: number) => setAutoRadius((prev) => (prev === r ? prev : r))
    apply(read(el.parentElement) || read(el.previousElementSibling))
  }, [radius, ref])

  const containerRadius = radius ?? autoRadius

  const paths = useMemo(() => {
    if (w <= inset * 2 || h <= inset * 2) return []
    const generator = rough.generator()
    const rw = w - inset * 2
    const rh = h - inset * 2
    // The outline sits `inset` inside the container, so its own corner radius is
    // the container radius minus the inset — a concentric, uniform-gap frame.
    const rr = Math.max(0, containerRadius - inset)
    const opts = { ...BOX_OPTIONS, seed: animSeed, bowing: bowing ?? BOX_OPTIONS.bowing }
    const drawable =
      rr > 0
        ? generator.path(roundedRectPath(inset, inset, rw, rh, rr), opts)
        : generator.rectangle(inset, inset, rw, rh, opts)
    return generator.toPaths(drawable).map((p) => p.d)
  }, [w, h, animSeed, containerRadius, inset, bowing])

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
