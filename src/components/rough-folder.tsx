import { useMemo } from "react"
import rough from "roughjs"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { useFolderTree } from "@/components/folder-tree"
import { cn } from "@/lib/utils"

/**
 * RoughFolder — home-page navigation drawn as a hand-drawn ink line-art folder
 * with roughjs. Loose, confident strokes on the near-white page; no fills.
 *
 * DETERMINISTIC SHAPE (no re-wobble):
 *   roughjs re-randomizes a shape on every generate unless a `seed` is given.
 *   Each folder is passed a FIXED integer `seed` (a constant from the home page),
 *   and the sketch is generated ONCE inside a useMemo keyed only on that seed —
 *   so the exact same silhouette is produced across re-renders, HMR, remounts and
 *   reloads, and it never re-roughens on hover/focus/theme change.
 *
 * ANATOMY — two stacked SVGs sharing a 136×108 viewBox so their coordinates align:
 *   - `.rough-folder__base` — the folder outline (body + tab) as one closed path.
 *   - `.rough-folder__lid`  — a second, pre-seeded flap. Hidden at rest; on hover
 *     it fades in and swings open (rotateX about its bottom hinge) so the folder
 *     appears to open. Because it's already drawn, opening only animates CSS
 *     opacity/transform — the strokes themselves never re-roughen.
 *
 * Ink colour is `currentColor` (theme-aware). Honours `prefers-reduced-motion`.
 *
 *   <RoughFolder index={2} seed={41} label="About" to="about-bharat-nag" />
 *   <RoughFolder index={4} seed={88} label="GitHub" href="https://..." />
 *
 * `to`   — opens an existing sidebar page id via the folder-tree `select()`.
 * `href` — renders an anchor (opens in a new tab). `to` is ignored when set.
 */
interface RoughFolderProps {
  /** Text shown beneath the folder. Also the control's accessible name. */
  label: string
  /** Fixed roughjs seed (integer 1..2^31). Persists the exact drawn shape. */
  seed: number
  /** Stagger index for the FadeInUp entrance (matches sibling content). */
  index?: number
  /** Sidebar page id to open (e.g. "about-bharat-nag"). Ignored if `href` is set. */
  to?: string
  /** External URL. When set, renders an anchor that opens in a new tab. */
  href?: string
  /**
   * Elongate the folder's right side by this many viewBox units (default 0). Only
   * the horizontal edges lengthen and the right edge shifts out — the tab/left edge
   * stay put. Real SVG geometry (no scaling), so strokes never squash or stretch.
   */
  widthExtend?: number
  /** Extra classes merged onto the FadeInUp wrapper. */
  className?: string
}

const VIEW_W = 136
const VIEW_H = 108
const STROKE_WIDTH = 1.6

/**
 * Folder silhouette (body + tab) and lid front cover, authored in the 136×108
 * viewBox with simple straight segments; the hand-drawn waver + slight corner
 * overshoot come from roughjs, not the geometry.
 *
 * `ext` (widthExtend, in viewBox units) elongates ONLY the right side: the tab and
 * left edge stay put while the top/bottom horizontal edges lengthen and the right
 * vertical shifts out by `ext`. This is real geometry — no CSS scaling — so the
 * strokes never squash or stretch.
 */
const BODY_RIGHT = 124 // right edge x of the body at rest (widthExtend 0)
const LID_RIGHT = 121 // right edge x of the lid front cover at rest
const folderPath = (ext: number) =>
  `M 12 16 L 52 16 L 68 34 L ${BODY_RIGHT + ext} 34 L ${BODY_RIGHT + ext} 94 L 12 94 Z`
const lidPath = (ext: number) => `M 15 40 L ${LID_RIGHT + ext} 40 L ${LID_RIGHT + ext} 90 L 15 90 Z`

/**
 * Shared draw options. `fill` is omitted (outlines only). `roughness` sits just
 * above the default 1 for a relaxed waver without a jagged scribble; `bowing`
 * keeps the edges hand-drawn rather than ruler-straight. Stroke colour is set in
 * the SVG (currentColor) so it stays theme-aware — roughjs' own stroke is unused.
 */
const DRAW_OPTIONS = {
  roughness: 1.2,
  bowing: 1.3,
  strokeWidth: STROKE_WIDTH,
  preserveVertices: false,
} as const

/**
 * Generate the (deterministic) roughjs path data for a given seed + width. Because
 * roughjs consumes its seeded RNG in path order, the fixed left points (tab + left
 * edge, drawn first) keep the SAME wobble as `ext` grows — only the elongating
 * right-side edges redraw. Memoised on [seed, ext] so it regenerates only when the
 * width actually changes, never on hover/re-render.
 */
function buildPaths(seed: number, ext: number) {
  const generator = rough.generator()
  const folder = generator
    .toPaths(generator.path(folderPath(ext), { ...DRAW_OPTIONS, seed }))
    .map((p) => p.d)
  const lid = generator
    .toPaths(generator.path(lidPath(ext), { ...DRAW_OPTIONS, seed: seed + 1 }))
    .map((p) => p.d)
  return { folder, lid }
}

/** The layered folder graphic. Decorative — the label names the control. */
function FolderGraphic({ seed, widthExtend }: { seed: number; widthExtend: number }) {
  const { folder, lid } = useMemo(() => buildPaths(seed, widthExtend), [seed, widthExtend])
  const viewBox = `0 0 ${VIEW_W + widthExtend} ${VIEW_H}`
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  // Grow the icon box in step with the viewBox (same aspect) so the SVG scales
  // uniformly — wider, never squashed/stretched. At widthExtend 0, defer to CSS.
  const iconStyle = widthExtend
    ? { aspectRatio: `${VIEW_W + widthExtend} / ${VIEW_H}`, width: "auto" }
    : undefined

  return (
    <span className="rough-folder__icon" style={iconStyle} aria-hidden="true">
      <svg className="rough-folder__base" viewBox={viewBox}>
        <g {...strokeProps}>
          {folder.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
      <svg className="rough-folder__lid" viewBox={viewBox}>
        <g {...strokeProps}>
          {lid.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    </span>
  )
}

export function RoughFolder({ label, seed, index = 0, to, href, widthExtend = 0, className }: RoughFolderProps) {
  const { select } = useFolderTree()

  return (
    <FadeInUp i={index} className={cn("inline-flex", className)}>
      {href ? (
        <a className="rough-folder" href={href} target="_blank" rel="noopener noreferrer">
          <FolderGraphic seed={seed} widthExtend={widthExtend} />
          <span className="rough-folder__label">{label}</span>
        </a>
      ) : (
        <button type="button" className="rough-folder" onClick={() => to && select(to)}>
          <FolderGraphic seed={seed} widthExtend={widthExtend} />
          <span className="rough-folder__label">{label}</span>
        </button>
      )}
    </FadeInUp>
  )
}
