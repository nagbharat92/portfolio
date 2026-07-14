import { useMemo } from "react"
import type { CSSProperties } from "react"
import { rectPath, roughPathInfos, type FillStyle } from "@/components/lab/rough"

/**
 * LabFolder — the Folder Lab's fully parametric hand-drawn folder.
 *
 * Two leaves share one viewBox so their strokes line up:
 *   - `.lab-folder__back`  — the folder body + tab (the "background" leaf).
 *   - `.lab-folder__front` — the front cover, a rectangle that at REST exactly
 *     overlaps the back's front face (so the strokes sit on top of each other).
 *
 * On hover the front leaf tilts open toward the viewer (its top edge splays
 * wider than the bottom via CSS perspective) while the back leaf recedes
 * (translateZ) and fades lighter — a 3-D "opening" with depth. All of it is
 * driven by CSS variables set from `config`, so the lab sliders tune it live.
 *
 * WIDTH / HEIGHT are real geometry (the right edge / bottom edge move out); the
 * viewBox and icon box grow in step so nothing squashes or stretches. Every
 * roughjs knob (roughness, bowing, stroke, fill pattern, …) is a prop too.
 */

const VIEW_W = 136
const VIEW_H = 108
const UNIT_REM = 6.75 / VIEW_H // rem per viewBox unit (rest height = 6.75rem)

// Rest geometry (viewBox units). Width pushes the right edge out; height the bottom.
const LEFT = 12
const TAB_TOP = 16
const TAB_RIGHT = 52
const BODY_TOP = 34
const NECK = 68
const BODY_RIGHT = 124
const BOTTOM = 94

const backPathFor = (w: number, h: number) =>
  `M ${LEFT} ${TAB_TOP} L ${TAB_RIGHT} ${TAB_TOP} L ${NECK} ${BODY_TOP} ` +
  `L ${BODY_RIGHT + w} ${BODY_TOP} L ${BODY_RIGHT + w} ${BOTTOM + h} L ${LEFT} ${BOTTOM + h} Z`

const frontPathFor = (w: number, h: number) =>
  rectPath(LEFT, BODY_TOP, BODY_RIGHT + w - LEFT, BOTTOM + h - BODY_TOP)

export interface LabFolderConfig {
  seed: number
  widthExtend: number
  heightExtend: number
  scale: number
  roughness: number
  bowing: number
  strokeWidth: number
  disableMultiStroke: boolean
  preserveVertices: boolean
  // hover / perspective
  lift: number
  tilt: number
  perspective: number
  backRecede: number
  backFade: number
  // colours
  backColor: string
  frontColor: string
  // front-leaf fill
  fillEnabled: boolean
  fillStyle: FillStyle
  fillGap: number
  fillAngle: number
  fillWeight: number
  fillColor: string
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
    scale,
    roughness,
    bowing,
    strokeWidth,
    disableMultiStroke,
    preserveVertices,
    lift,
    tilt,
    perspective,
    backRecede,
    backFade,
    backColor,
    frontColor,
    fillEnabled,
    fillStyle,
    fillGap,
    fillAngle,
    fillWeight,
    fillColor,
  } = config

  const back = useMemo(
    () =>
      roughPathInfos(backPathFor(w, h), {
        roughness,
        bowing,
        strokeWidth,
        disableMultiStroke,
        preserveVertices,
        seed,
        fill: "none",
      }).map((p) => p.d),
    [w, h, roughness, bowing, strokeWidth, disableMultiStroke, preserveVertices, seed],
  )

  const front = useMemo(
    () =>
      roughPathInfos(frontPathFor(w, h), {
        roughness,
        bowing,
        strokeWidth,
        disableMultiStroke,
        preserveVertices,
        seed: seed + 1,
        fill: "none",
      }).map((p) => p.d),
    [w, h, roughness, bowing, strokeWidth, disableMultiStroke, preserveVertices, seed],
  )

  const fill = useMemo(
    () =>
      fillEnabled
        ? roughPathInfos(frontPathFor(w, h), {
            roughness,
            bowing,
            seed: seed + 2,
            fill: fillColor,
            fillStyle,
            hachureGap: fillGap,
            hachureAngle: fillAngle,
            fillWeight,
            stroke: "none",
          })
        : [],
    [fillEnabled, w, h, roughness, bowing, seed, fillColor, fillStyle, fillGap, fillAngle, fillWeight],
  )

  const viewBox = `0 0 ${VIEW_W + w} ${VIEW_H + h}`
  // "Size" grows the icon box for real (reflows) rather than a CSS scale, so a
  // bigger folder never overflows the stage and overlaps the controls.
  const iconStyle: CSSProperties = {
    width: `${(VIEW_W + w) * UNIT_REM * scale}rem`,
    height: `${(VIEW_H + h) * UNIT_REM * scale}rem`,
  }
  // Direction is fixed for the intended "opening toward you" look: lift up, tilt
  // the front's top toward the viewer (wider), push the back away.
  const rootStyle = {
    "--lab-persp": `${perspective}px`,
    "--lab-lift": `${-Math.abs(lift)}px`,
    "--lab-tilt": `${-Math.abs(tilt)}deg`,
    "--lab-back-z": `${-Math.abs(backRecede)}px`,
    "--lab-back-fade": `${backFade}`,
  } as CSSProperties

  const stroke = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth }

  return (
    <button type="button" aria-label={label ?? "Folder preview"} className="lab-folder" style={rootStyle}>
      <span className="lab-folder__icon" style={iconStyle} aria-hidden="true">
        <svg className="lab-folder__back" viewBox={viewBox}>
          <g fill="none" stroke={backColor} {...stroke}>
            {back.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </svg>
        <svg className="lab-folder__front" viewBox={viewBox}>
          {fill.length > 0 && (
            <g>
              {fill.map((p, i) => (
                <path
                  key={`f${i}`}
                  d={p.d}
                  stroke={p.stroke}
                  fill={p.fill ?? "none"}
                  strokeWidth={p.strokeWidth}
                />
              ))}
            </g>
          )}
          <g fill="none" stroke={frontColor} {...stroke}>
            {front.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </svg>
      </span>
      {label && <span className="lab-folder__label">{label}</span>}
    </button>
  )
}
