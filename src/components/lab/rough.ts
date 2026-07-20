import rough from "roughjs"
import { INK } from "@/lib/ink"

/**
 * Shared hand-drawn ("squiggly") ink settings + geometry for all lab UI.
 *
 * Every lab control (slider, divider, checkbox, tiles, …) draws with the ONE
 * site-wide ink token (@/lib/ink), so the lab chrome matches the rest of the
 * site and there is a single place to tune every stroke. When we build more
 * controls, reuse these helpers so they stay visually consistent.
 *
 * DETERMINISTIC: shapes are generated once from a fixed integer `seed`, so a
 * control's sketch never re-wobbles as its value changes. Moving parts (e.g. a
 * slider thumb) are drawn at the origin and repositioned with an SVG transform
 * rather than re-generated.
 */
export const ROUGH_OPTIONS = INK

/** Ink stroke width shared by every lab control. */
export const STROKE_WIDTH = ROUGH_OPTIONS.strokeWidth

/** Shared pixel width for stacked lab controls so they line up. */
export const LAB_WIDTH = 360

const generator = rough.generator()

/** Hand-drawn straight line → SVG path `d` strings. */
export function linePaths(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
): string[] {
  return generator
    .toPaths(generator.line(x1, y1, x2, y2, { ...ROUGH_OPTIONS, seed }))
    .map((p) => p.d)
}

/** Hand-drawn circle (centred at cx,cy) → SVG path `d` strings. An optional
 *  `bowing` override lets a caller draw a curvier (e.g. animated/boiling) circle
 *  than the flat site ink; omit it to use the shared INK bowing. */
export function circlePaths(
  cx: number,
  cy: number,
  diameter: number,
  seed: number,
  bowing?: number,
): string[] {
  const options = bowing === undefined ? { ...ROUGH_OPTIONS, seed } : { ...ROUGH_OPTIONS, seed, bowing }
  return generator
    .toPaths(generator.circle(cx, cy, diameter, options))
    .map((p) => p.d)
}

// ─── Parametric helpers (Folder Lab folder + colour/pattern tiles) ───────────

/** A single roughjs path plus the stroke/fill hints needed to paint it. */
export type RoughPathInfo = { d: string; stroke: string; strokeWidth: number; fill?: string }

/**
 * Full roughjs path infos for a raw SVG path string + arbitrary options. Unlike
 * linePaths/circlePaths (which bake the shared ink options), this passes the
 * caller's own options through — so the lab can drive every roughjs knob
 * (roughness, bowing, fill, fillStyle, hachureGap, …). Outline paths can be
 * re-coloured on render; FILL paths must keep their stroke/fill/strokeWidth so
 * hachure / cross-hatch / dots / solid fills paint correctly.
 */
export function roughPathInfos(d: string, options: Record<string, unknown>): RoughPathInfo[] {
  return generator.toPaths(generator.path(d, options)) as RoughPathInfo[]
}

/** Rectangle as an SVG path string (for rough outlines / fills). */
export function rectPath(x: number, y: number, w: number, h: number): string {
  return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`
}

/**
 * SVG path for a CLOSED polygon with rounded corners (radius r, in the points'
 * own units). Each corner becomes a quadratic Bézier whose control point is the
 * original vertex, so it rounds BOTH convex and concave corners. r is clamped
 * per-corner to half of each adjacent edge so neighbouring corners never overlap.
 * r <= 0 falls back to sharp corners (byte-identical to a plain M/L polygon).
 */
export function roundedPolygonPath(pts: { x: number; y: number }[], r: number): string {
  const n = pts.length
  if (n < 3) return ""
  if (r <= 0) {
    return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") + " Z"
  }
  const round = (v: number) => Math.round(v * 100) / 100
  const entry: { x: number; y: number }[] = []
  const exit: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const curr = pts[i]
    const prev = pts[(i - 1 + n) % n]
    const next = pts[(i + 1) % n]
    const dPrev = Math.hypot(prev.x - curr.x, prev.y - curr.y) || 1
    const dNext = Math.hypot(next.x - curr.x, next.y - curr.y) || 1
    const rr = Math.min(r, dPrev / 2, dNext / 2)
    entry.push({ x: round(curr.x + ((prev.x - curr.x) / dPrev) * rr), y: round(curr.y + ((prev.y - curr.y) / dPrev) * rr) })
    exit.push({ x: round(curr.x + ((next.x - curr.x) / dNext) * rr), y: round(curr.y + ((next.y - curr.y) / dNext) * rr) })
  }
  let d = `M ${entry[0].x} ${entry[0].y}`
  for (let i = 0; i < n; i++) {
    d += ` Q ${pts[i].x} ${pts[i].y} ${exit[i].x} ${exit[i].y}`
    if (i < n - 1) d += ` L ${entry[i + 1].x} ${entry[i + 1].y}`
  }
  return d + " Z"
}

/** roughjs fill patterns worth exposing in the lab. */
export const FILL_STYLES = [
  "hachure",
  "cross-hatch",
  "zigzag",
  "dots",
  "dashed",
  "zigzag-line",
] as const
export type FillStyle = (typeof FILL_STYLES)[number]
