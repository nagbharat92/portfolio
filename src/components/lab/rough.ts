import rough from "roughjs"

/**
 * Shared hand-drawn ("squiggly") ink settings + geometry for all Folder Lab UI.
 *
 * Every lab control (slider, divider, …) is drawn with roughjs using THESE
 * options, so the whole toolkit shares one look that matches the folder on the
 * home page (src/components/rough-folder.tsx — roughness 1.2 / bowing 1.3 /
 * stroke 1.6). When we build more controls, reuse these helpers so they stay
 * visually consistent.
 *
 * DETERMINISTIC: shapes are generated once from a fixed integer `seed`, so a
 * control's sketch never re-wobbles as its value changes. Moving parts (e.g. a
 * slider thumb) are drawn at the origin and repositioned with an SVG transform
 * rather than re-generated.
 */
export const ROUGH_OPTIONS = {
  roughness: 1.2,
  bowing: 1.3,
  strokeWidth: 1.6,
  preserveVertices: false,
} as const

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

/** Hand-drawn circle (centred at cx,cy) → SVG path `d` strings. */
export function circlePaths(
  cx: number,
  cy: number,
  diameter: number,
  seed: number,
): string[] {
  return generator
    .toPaths(generator.circle(cx, cy, diameter, { ...ROUGH_OPTIONS, seed }))
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
