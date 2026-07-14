import { useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { LabFolder, type LabFolderConfig } from "@/components/lab/lab-folder"
import { RoughDivider } from "@/components/lab/rough-divider"
import { RoughSlider } from "@/components/lab/rough-slider"
import { RoughCheckbox } from "@/components/lab/rough-checkbox"
import { RoughSwatches, RoughPatterns, SWATCHES } from "@/components/lab/rough-tiles"
import type { FillStyle } from "@/components/lab/rough"

interface FolderLabProps {
  index: number
  props?: Record<string, unknown>
}

const fmtScale = (v: number) => `${v.toFixed(1)}×`
const fmtAddPx = (v: number) => `+${Math.round(v)}px`
const fmtPx = (v: number) => `${Math.round(v)}px`
const fmtDeg = (v: number) => `${Math.round(v)}°`
const fmt1 = (v: number) => v.toFixed(1)
const fmtInt = (v: number) => `${Math.round(v)}`
const fmtPct = (v: number) => `${Math.round(v * 100)}%`

/** A titled group whose slider children flow into as many columns as fit. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid items-end gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
        {children}
      </div>
    </section>
  )
}

/**
 * FolderLab — a full playground for the hand-drawn folder. The folder (a fully
 * parametric LabFolder) sits on a stage up top; every roughjs + geometry +
 * perspective + colour + fill knob is exposed below as a hand-drawn control,
 * laid out in a responsive multi-column grid so it all fits without scrolling.
 */
export function FolderLab({ index }: FolderLabProps) {
  // Dimensions
  const [size, setSize] = useState(1.4)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  // Ink (roughjs)
  const [roughness, setRoughness] = useState(1.2)
  const [bowing, setBowing] = useState(1.3)
  const [strokeWidth, setStrokeWidth] = useState(1.6)
  const [seed, setSeed] = useState(7)
  const [singleStroke, setSingleStroke] = useState(false)
  const [preserveVertices, setPreserveVertices] = useState(false)
  // Perspective (hover)
  const [lift, setLift] = useState(10)
  const [tilt, setTilt] = useState(34)
  const [perspective, setPerspective] = useState(600)
  const [backRecede, setBackRecede] = useState(24)
  const [backFade, setBackFade] = useState(0.5)
  // Colour
  const [swatchIndex, setSwatchIndex] = useState(-1)
  // Front-leaf fill
  const [fillEnabled, setFillEnabled] = useState(false)
  const [fillStyle, setFillStyle] = useState<FillStyle>("cross-hatch")
  const [fillGap, setFillGap] = useState(6)
  const [fillAngle, setFillAngle] = useState(-41)
  const [fillWeight, setFillWeight] = useState(1)

  // Resolve the theme ink colour (roughjs bakes fill colours at generate time).
  const inkRef = useRef<HTMLSpanElement>(null)
  const [ink, setInk] = useState("#1c1c1e")
  useLayoutEffect(() => {
    const el = inkRef.current
    if (el) setInk(getComputedStyle(el).color)
  }, [])

  const sw = swatchIndex >= 0 ? SWATCHES[swatchIndex] : null
  const config: LabFolderConfig = {
    seed,
    widthExtend: width,
    heightExtend: height,
    scale: size,
    roughness,
    bowing,
    strokeWidth,
    disableMultiStroke: singleStroke,
    preserveVertices,
    lift,
    tilt,
    perspective,
    backRecede,
    backFade,
    backColor: sw ? sw.back : "currentColor",
    frontColor: sw ? sw.front : "currentColor",
    fillEnabled,
    fillStyle,
    fillGap,
    fillAngle,
    fillWeight,
    fillColor: sw ? sw.front : ink,
  }

  return (
    <div className="flex w-full flex-col">
      <span ref={inkRef} aria-hidden className="pointer-events-none absolute h-0 w-0 text-foreground" />

      {/* Pinned — the folder + divider stay in view while the controls scroll
          beneath them; a fade scrim dissolves controls as they pass the divider. */}
      <div className="sticky top-0 z-10 bg-background pt-2">
        <div className="flex min-h-60 w-full items-center justify-center">
          <LabFolder config={config} />
        </div>
        <div className="flex justify-center">
          <RoughDivider />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 translate-y-full bg-linear-to-b from-background to-background/0"
        />
      </div>

      {/* Controls — scroll beneath the pinned folder. */}
      <div className="flex flex-col gap-7 pt-7">
        <Section title="Dimensions">
          <RoughSlider label="Size" value={size} min={0.6} max={2} step={0.1} onChange={setSize} format={fmtScale} seed={11} />
          <RoughSlider label="Width" value={width} min={0} max={160} step={2} onChange={setWidth} format={fmtAddPx} seed={12} />
          <RoughSlider label="Height" value={height} min={0} max={120} step={2} onChange={setHeight} format={fmtAddPx} seed={13} />
        </Section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ink (roughjs)</h3>
          <div className="grid items-end gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
            <RoughSlider label="Roughness" value={roughness} min={0} max={4} step={0.1} onChange={setRoughness} format={fmt1} seed={21} />
            <RoughSlider label="Bowing" value={bowing} min={0} max={6} step={0.1} onChange={setBowing} format={fmt1} seed={22} />
            <RoughSlider label="Stroke width" value={strokeWidth} min={0.5} max={5} step={0.1} onChange={setStrokeWidth} format={fmt1} seed={23} />
            <RoughSlider label="Seed" value={seed} min={1} max={60} step={1} onChange={setSeed} format={fmtInt} seed={24} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <RoughCheckbox label="Single stroke" checked={singleStroke} onChange={setSingleStroke} seed={31} />
            <RoughCheckbox label="Preserve vertices" checked={preserveVertices} onChange={setPreserveVertices} seed={32} />
          </div>
        </section>

        <Section title="Perspective (hover)">
          <RoughSlider label="Lift" value={lift} min={0} max={24} step={1} onChange={setLift} format={fmtPx} seed={41} />
          <RoughSlider label="Front tilt" value={tilt} min={0} max={60} step={1} onChange={setTilt} format={fmtDeg} seed={42} />
          <RoughSlider label="Perspective" value={perspective} min={200} max={1200} step={20} onChange={setPerspective} format={fmtPx} seed={43} />
          <RoughSlider label="Back recede" value={backRecede} min={0} max={80} step={2} onChange={setBackRecede} format={fmtPx} seed={44} />
          <RoughSlider label="Back fade" value={backFade} min={0.2} max={1} step={0.05} onChange={setBackFade} format={fmtPct} seed={45} />
        </Section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colour</h3>
          <RoughSwatches value={swatchIndex} onChange={setSwatchIndex} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Front-leaf fill</h3>
          <RoughCheckbox label="Cross-hatch the front leaf" checked={fillEnabled} onChange={setFillEnabled} seed={71} />
          {fillEnabled && (
            <div className="flex flex-col gap-4 pt-1">
              <RoughPatterns value={fillStyle} onChange={setFillStyle} ink={config.fillColor} />
              <div className="grid items-end gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
                <RoughSlider label="Pattern scale" value={fillGap} min={2} max={20} step={0.5} onChange={setFillGap} format={fmt1} seed={72} />
                <RoughSlider label="Pattern angle" value={fillAngle} min={-90} max={90} step={1} onChange={setFillAngle} format={fmtDeg} seed={73} />
                <RoughSlider label="Fill weight" value={fillWeight} min={0.5} max={4} step={0.1} onChange={setFillWeight} format={fmt1} seed={74} />
              </div>
            </div>
          )}
        </section>

        <FadeInUp i={index + 6}>
          <p className="pt-2 text-center text-sm text-muted-foreground">
            Hover the folder to see it open. Every control redraws the real roughjs sketch.
          </p>
        </FadeInUp>
      </div>
    </div>
  )
}
