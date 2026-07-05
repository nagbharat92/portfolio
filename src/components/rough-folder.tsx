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
  /** Extra classes merged onto the FadeInUp wrapper. */
  className?: string
}

const VIEW_W = 136
const VIEW_H = 108
const STROKE_WIDTH = 1.6

/**
 * Folder silhouette (body + tab) as a single closed path, and the pre-seeded lid
 * flap — both authored in the 136×108 viewBox with simple straight segments; the
 * hand-drawn waver + slight corner overshoot come from roughjs, not the geometry.
 */
const FOLDER_PATH = "M 12 16 L 52 16 L 68 34 L 124 34 L 124 94 L 12 94 Z"
// The lid is the folder's FRONT cover (inset slightly from the body). It's hidden
// at rest and, on hover, swings open about its bottom hinge so the folder opens.
const LID_PATH = "M 15 40 L 121 40 L 121 90 L 15 90 Z"

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

/** Generate the (deterministic) roughjs path data once for a given seed. */
function buildPaths(seed: number) {
  const generator = rough.generator()
  const folder = generator
    .toPaths(generator.path(FOLDER_PATH, { ...DRAW_OPTIONS, seed }))
    .map((p) => p.d)
  const lid = generator
    .toPaths(generator.path(LID_PATH, { ...DRAW_OPTIONS, seed: seed + 1 }))
    .map((p) => p.d)
  return { folder, lid }
}

/** The layered folder graphic. Decorative — the label names the control. */
function FolderGraphic({ seed }: { seed: number }) {
  const { folder, lid } = useMemo(() => buildPaths(seed), [seed])
  const viewBox = `0 0 ${VIEW_W} ${VIEW_H}`
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  return (
    <span className="rough-folder__icon" aria-hidden="true">
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

export function RoughFolder({ label, seed, index = 0, to, href, className }: RoughFolderProps) {
  const { select } = useFolderTree()

  return (
    <FadeInUp i={index} className={cn("inline-flex", className)}>
      {href ? (
        <a className="rough-folder" href={href} target="_blank" rel="noopener noreferrer">
          <FolderGraphic seed={seed} />
          <span className="rough-folder__label">{label}</span>
        </a>
      ) : (
        <button type="button" className="rough-folder" onClick={() => to && select(to)}>
          <FolderGraphic seed={seed} />
          <span className="rough-folder__label">{label}</span>
        </button>
      )}
    </FadeInUp>
  )
}
