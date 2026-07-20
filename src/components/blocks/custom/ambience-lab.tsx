import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { FadeInUp } from '@/components/ui/fade-in-up'
import { RoughSlider } from '@/components/lab/rough-slider'
import { RoughCheckbox } from '@/components/lab/rough-checkbox'
import { AmbienceOverlay } from '@/components/ambience/noise-dapple'
import { DEFAULT_DAPPLE, type DappleParams } from '@/components/ambience/dapple-params'

interface AmbienceLabProps {
  index: number
  props?: Record<string, unknown>
}

const fmt1 = (v: number) => v.toFixed(1)
const fmt2 = (v: number) => v.toFixed(2)
const fmtInt = (v: number) => `${Math.round(v)}`
const fmtDeg = (v: number) => `${Math.round(v)}°`
const fmtPx = (v: number) => `${v.toFixed(1)}px`

/**
 * A titled card — a light, sidebar-coloured panel grouping one control section,
 * matching the Strokes / Type / Colour / Motion labs. Publishes `--lab-surface`
 * so descendant slider knobs mask to the card's own background.
 */
function Card({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      style={{ '--lab-surface': 'var(--color-sidebar)' } as CSSProperties}
      className="flex flex-col gap-4 rounded-2xl bg-(--lab-surface) p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {action ? <div className="-mr-2">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

/** Resets every parameter on the page to DEFAULTS. */
function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="Reset all controls to their defaults"
      title="Reset to defaults"
      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <RotateCcw className="size-4 shrink-0" />
      <span className="text-xs font-semibold uppercase tracking-wider">Reset</span>
    </button>
  )
}

/**
 * The default value of every control — the SINGLE source of truth for both the
 * initial state and Reset, so they can never drift. (Mirrors the DEFAULTS
 * pattern in the other labs.) Seeded from the shared DEFAULT_DAPPLE so the lab
 * and the drop-in <AmbienceLayer/> start from the same look.
 */
const DEFAULTS = { ...DEFAULT_DAPPLE }

/**
 * AmbienceLab — the experiment page for the ambient leaf-dapple.
 *
 * The effect is a full-screen fragment shader (procedural noise, no 3D), and
 * this page is its playground: dummy reading content on the left so the drift
 * has real text to fall across, and a control rail on the right that drives the
 * shader's parameters live.
 */
export function AmbienceLab({ index }: AmbienceLabProps) {
  const [scale, setScale] = useState(DEFAULTS.scale)
  const [octaves, setOctaves] = useState(DEFAULTS.octaves)
  const [warp, setWarp] = useState(DEFAULTS.warp)
  const [density, setDensity] = useState(DEFAULTS.density)
  const [softness, setSoftness] = useState(DEFAULTS.softness)
  const [contrast, setContrast] = useState(DEFAULTS.contrast)
  const [driftSpeed, setDriftSpeed] = useState(DEFAULTS.driftSpeed)
  const [driftAngle, setDriftAngle] = useState(DEFAULTS.driftAngle)
  const [strength, setStrength] = useState(DEFAULTS.strength)
  const [coverage, setCoverage] = useState(DEFAULTS.coverage)
  const [blur, setBlur] = useState(DEFAULTS.blur)
  const [enabled, setEnabled] = useState(true)

  const reset = () => {
    setScale(DEFAULTS.scale)
    setOctaves(DEFAULTS.octaves)
    setWarp(DEFAULTS.warp)
    setDensity(DEFAULTS.density)
    setSoftness(DEFAULTS.softness)
    setContrast(DEFAULTS.contrast)
    setDriftSpeed(DEFAULTS.driftSpeed)
    setDriftAngle(DEFAULTS.driftAngle)
    setStrength(DEFAULTS.strength)
    setCoverage(DEFAULTS.coverage)
    setBlur(DEFAULTS.blur)
  }

  const params: DappleParams = {
    scale,
    octaves,
    warp,
    density,
    softness,
    contrast,
    driftSpeed,
    driftAngle,
    strength,
    blur,
    coverage,
  }

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* ── Reading content — the dapple falls across it ──────────────────── */}
      <FadeInUp i={index} className="min-w-0 flex-1">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Experiment
        </p>
        <h2 className="mt-2 font-display text-[2rem] leading-[1.1] tracking-tight text-foreground">
          Reading in the shade
        </h2>
        <p className="mt-4 text-(length:--content-body-size) leading-relaxed text-muted-foreground">
          Soft, drifting leaf-dapple rakes across the page from one corner. It's
          not a 3D scene or a video — it's a single fragment shader painting
          domain-warped fractal noise, thresholded into shadow with bright gaps
          of light coming through. Every knob in the panel changes the look live.
        </p>

        <h3 className="mt-10 font-display text-[1.5rem] leading-tight text-foreground">
          Sunlight through leaves
        </h3>
        <p className="mt-3 text-(length:--content-body-size) leading-relaxed text-foreground/90">
          The canvas is composited with <code>mix-blend-mode: multiply</code>, so
          only the dark pixels tint what's underneath and everything else stays
          invisible — your words keep their contrast. Keeping it in one corner is
          the important call: the reading column stays calm while the shade reads
          as an atmospheric edge treatment rather than a busy pattern on every
          line.
        </p>
        <p className="mt-4 text-(length:--content-body-size) leading-relaxed text-foreground/90">
          <span className="font-medium text-foreground">Canopy</span> sets the
          size and organic-ness of the clumps;{' '}
          <span className="font-medium text-foreground">Light gaps</span> decide
          how much light breaks through and how crisp the edges are;{' '}
          <span className="font-medium text-foreground">Drift</span> is the
          breeze; and <span className="font-medium text-foreground">Blend</span>{' '}
          controls how it lands on the page.
        </p>

        <h3 className="mt-10 font-display text-[1.5rem] leading-tight text-foreground">
          A gentler pace
        </h3>
        <p className="mt-3 text-(length:--content-body-size) leading-relaxed text-foreground/90">
          It stays out of your way: the shadow strength crosses over when you
          switch the site between light and dark, the pixel ratio is capped, the
          render loop freezes when the tab is hidden, and it holds a single
          static frame under reduced-motion.
        </p>
      </FadeInUp>

      {/* ── Control rail — the parameters ─────────────────────────────────── */}
      <FadeInUp
        i={index + 1}
        className="w-full shrink-0 lg:sticky lg:top-(--content-pt) lg:w-80"
      >
        <div className="flex flex-col gap-4">
          <Card title="Canopy" action={<ResetButton onReset={reset} />}>
            <RoughSlider label="Scale" value={scale} min={0.5} max={6} step={0.1} onChange={setScale} format={fmt1} seed={11} />
            <RoughSlider label="Detail" value={octaves} min={1} max={6} step={1} onChange={setOctaves} format={fmtInt} seed={12} />
            <RoughSlider label="Warp" value={warp} min={0} max={1.5} step={0.05} onChange={setWarp} format={fmt2} seed={13} />
          </Card>

          <Card title="Light gaps">
            <RoughSlider label="Density" value={density} min={0.2} max={0.8} step={0.01} onChange={setDensity} format={fmt2} seed={21} />
            <RoughSlider label="Softness" value={softness} min={0.02} max={0.5} step={0.01} onChange={setSoftness} format={fmt2} seed={22} />
            <RoughSlider label="Contrast" value={contrast} min={0.5} max={2.5} step={0.05} onChange={setContrast} format={fmt2} seed={23} />
          </Card>

          <Card title="Drift">
            <RoughSlider label="Speed" value={driftSpeed} min={0} max={1} step={0.01} onChange={setDriftSpeed} format={fmt2} seed={31} />
            <RoughSlider label="Direction" value={driftAngle} min={0} max={360} step={1} onChange={setDriftAngle} format={fmtDeg} seed={32} />
          </Card>

          <Card title="Blend">
            <RoughSlider label="Strength" value={strength} min={0} max={1} step={0.01} onChange={setStrength} format={fmt2} seed={41} />
            <RoughSlider label="Coverage" value={coverage} min={0.5} max={1.8} step={0.05} onChange={setCoverage} format={fmt2} seed={42} />
            <RoughSlider label="Blur" value={blur} min={0} max={12} step={0.5} onChange={setBlur} format={fmtPx} seed={43} />
            <div className="pt-1">
              <RoughCheckbox label="Effect on" checked={enabled} onChange={setEnabled} seed={51} />
            </div>
          </Card>
        </div>
      </FadeInUp>

      {/* The effect itself — fixed, full-viewport, driven by the live params. */}
      {enabled && <AmbienceOverlay params={params} />}
    </div>
  )
}
