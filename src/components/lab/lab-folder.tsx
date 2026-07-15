import { useMemo } from "react"
import type { CSSProperties } from "react"
import { roughPathInfos, roundedPolygonPath } from "@/components/lab/rough"

/**
 * LabFolder — the Folder Lab's fully parametric hand-drawn folder.
 *
 * Two leaves share one viewBox so their strokes line up:
 *   - `.lab-folder__back`  — the folder body + tab (the "background" leaf).
 *   - `.lab-folder__front` — the front cover, a rectangle that at REST exactly
 *     overlaps the back's front face (so the strokes sit on top of each other).
 *
 * On hover BOTH leaves hinge about their shared bottom edge (a true hinge): the
 * front tilts open toward the viewer (its top edge splays wider via CSS
 * perspective) while the back tilts away — a 3-D "opening" with depth. Because
 * both pivot about the same bottom line, their bottom corners stay pinned
 * together, and both leaves render in one identical colour. All of it is driven
 * by CSS variables set from `config`, so the lab sliders tune it live.
 *
 * WIDTH / HEIGHT are real geometry (the right edge / bottom edge move out); the
 * viewBox and icon box grow in step so nothing squashes or stretches. Every
 * roughjs knob (roughness, bowing, stroke, fill pattern, …) is a prop too.
 */

const VIEW_W = 136
const VIEW_H = 108
const UNIT_REM = 6.75 / VIEW_H // rem per viewBox unit (rest height = 6.75rem)

// Rest geometry (viewBox units). Width pushes the right edge out; height the
// bottom. The tab (the nub on the back leaf) has its own deltas: `tw` slides its
// right edge + neck outward (wider nub); `th` lifts its top edge up (taller nub).
const LEFT = 12
const TAB_TOP = 16
const TAB_RIGHT = 52
const BODY_TOP = 34
const NECK = 68
const BODY_RIGHT = 124
const BOTTOM = 94
// Headroom kept above the tab so the roughjs wobble never clips the viewBox top.
const TAB_HEADROOM = 8

const backPointsFor = (w: number, h: number, tw: number, th: number) => [
  { x: LEFT, y: TAB_TOP - th },
  { x: TAB_RIGHT + tw, y: TAB_TOP - th },
  { x: NECK + tw, y: BODY_TOP }, // concave neck (tab meets body)
  { x: BODY_RIGHT + w, y: BODY_TOP },
  { x: BODY_RIGHT + w, y: BOTTOM + h },
  { x: LEFT, y: BOTTOM + h },
]

const frontPointsFor = (w: number, h: number) => [
  { x: LEFT, y: BODY_TOP },
  { x: BODY_RIGHT + w, y: BODY_TOP },
  { x: BODY_RIGHT + w, y: BOTTOM + h },
  { x: LEFT, y: BOTTOM + h },
]

// `r` (corner radius, viewBox units) rounds EVERY corner — the convex ones and
// the concave neck. r = 0 gives the original sharp folder.
const backPathFor = (w: number, h: number, tw: number, th: number, r: number) =>
  roundedPolygonPath(backPointsFor(w, h, tw, th), r)
const frontPathFor = (w: number, h: number, r: number) => roundedPolygonPath(frontPointsFor(w, h), r)

// How far the tab pushes above the viewBox top once it outgrows its headroom;
// the viewBox + icon box grow upward by this so a tall tab never clips.
const topPadFor = (th: number) => Math.max(0, th - (TAB_TOP - TAB_HEADROOM))

export interface LabFolderConfig {
  seed: number
  widthExtend: number
  heightExtend: number
  // tab (nub) geometry — its own width/height deltas, independent of the body
  tabWidthExtend: number
  tabHeightExtend: number
  scale: number
  cornerRadius: number
  roughness: number
  bowing: number
  strokeWidth: number
  disableMultiStroke: boolean
  preserveVertices: boolean
  // hover / perspective
  lift: number
  tilt: number
  perspective: number
  backTilt: number
  // colours
  backColor: string
  frontColor: string
  // back-leaf fill (solid "full fill") — its own roughness/bowing, separate from the stroke
  fillEnabled: boolean
  fillColor: string
  fillRoughness: number
  fillBowing: number
}

interface LabFolderProps {
  config: LabFolderConfig
  label?: string
}

export function LabFolder({ config, label }: LabFolderProps) {
  const {
    seed,
    widthExtend: w,
    heightExtend: h,
    tabWidthExtend: tw,
    tabHeightExtend: th,
    scale,
    cornerRadius,
    roughness,
    bowing,
    strokeWidth,
    disableMultiStroke,
    preserveVertices,
    lift,
    tilt,
    perspective,
    backTilt,
    backColor,
    frontColor,
    fillEnabled,
    fillColor,
    fillRoughness,
    fillBowing,
  } = config

  const back = useMemo(
    () =>
      roughPathInfos(backPathFor(w, h, tw, th, cornerRadius), {
        roughness,
        bowing,
        strokeWidth,
        disableMultiStroke,
        preserveVertices,
        seed,
        fill: "none",
      }).map((p) => p.d),
    [w, h, tw, th, cornerRadius, roughness, bowing, strokeWidth, disableMultiStroke, preserveVertices, seed],
  )

  const front = useMemo(
    () =>
      roughPathInfos(frontPathFor(w, h, cornerRadius), {
        roughness,
        bowing,
        strokeWidth,
        disableMultiStroke,
        preserveVertices,
        seed: seed + 1,
        fill: "none",
      }).map((p) => p.d),
    [w, h, cornerRadius, roughness, bowing, strokeWidth, disableMultiStroke, preserveVertices, seed],
  )

  // Solid "full fill" of the BACK leaf (body + tab). It sits behind the opaque
  // front cover, so only the part above the cover — the tab — shows filled, like
  // a real folder's dark back panel peeking above the front.
  const backFill = useMemo(
    () =>
      fillEnabled
        ? roughPathInfos(backPathFor(w, h, tw, th, cornerRadius), {
            roughness: fillRoughness,
            bowing: fillBowing,
            seed: seed + 2,
            fill: fillColor,
            fillStyle: "solid",
            stroke: "none",
          })
        : [],
    [fillEnabled, w, h, tw, th, cornerRadius, fillRoughness, fillBowing, seed, fillColor],
  )

  // The tab can grow taller than the original headroom above it; when it does,
  // topPad extends the viewBox (and icon box) upward so the tall tab never clips.
  const topPad = topPadFor(th)
  const viewBox = `0 ${-topPad} ${VIEW_W + w} ${VIEW_H + h + topPad}`
  // "Size" grows the icon box for real (reflows) rather than a CSS scale, so a
  // bigger folder never overflows the stage and overlaps the controls.
  const iconStyle: CSSProperties = {
    width: `${(VIEW_W + w) * UNIT_REM * scale}rem`,
    height: `${(VIEW_H + h + topPad) * UNIT_REM * scale}rem`,
  }
  // Direction is fixed for the intended "opening toward you" look: lift up, tilt
  // the front's top toward the viewer (wider), tilt the back's top away.
  const rootStyle = {
    "--lab-persp": `${perspective}px`,
    "--lab-lift": `${-Math.abs(lift)}px`,
    "--lab-tilt": `${-Math.abs(tilt)}deg`,
    // Shared hinge line: the folder's real bottom edge as a % of the icon-box
    // height. Both leaves pivot here so their bottom corners stay pinned; it
    // shifts as the height slider grows the folder downward (and topPad grows it up).
    "--lab-hinge": `${((BOTTOM + h + topPad) / (VIEW_H + h + topPad)) * 100}%`,
    "--lab-back-tilt": `${Math.abs(backTilt)}deg`,
  } as CSSProperties

  const stroke = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth }

  return (
    <button type="button" aria-label={label ?? "Folder preview"} className="lab-folder" style={rootStyle}>
      <span className="lab-folder__icon" style={iconStyle} aria-hidden="true">
        <svg className="lab-folder__back" viewBox={viewBox}>
          {backFill.length > 0 && (
            <g>
              {backFill.map((p, i) => (
                <path
                  key={`bf${i}`}
                  d={p.d}
                  stroke={p.stroke}
                  fill={p.fill ?? "none"}
                  strokeWidth={p.strokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}
          <g fill="none" stroke={backColor} {...stroke}>
            {back.map((d, i) => (
              <path key={i} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </svg>
        <svg className="lab-folder__front" viewBox={viewBox}>
          {/* Opaque cover — the real folder's FRONT panel. A clean (non-roughjs)
              fill in the surface colour hides the back's filled body so only the
              back's tab shows through above it. */}
          <path d={frontPathFor(w, h, cornerRadius)} fill="var(--lab-surface, var(--color-background))" />
          <g fill="none" stroke={frontColor} {...stroke}>
            {front.map((d, i) => (
              <path key={i} d={d} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </svg>
      </span>
      {label && <span className="lab-folder__label">{label}</span>}
    </button>
  )
}
