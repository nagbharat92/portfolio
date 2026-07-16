import { useMemo, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { RotateCcw } from "lucide-react"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughSlider } from "@/components/lab/rough-slider"
import { ROUGH_OPTIONS, rectPath, roughPathInfos } from "@/components/lab/rough"
import { cn } from "@/lib/utils"

interface ColorLabProps {
  index: number
  props?: Record<string, unknown>
}

// ── Colour maths ──────────────────────────────────────────────────────────────
// The whole lab works in HSL because the request is about hue and shade: "same
// hue, different shade" is just a lightness step, and "complementary" is a 180°
// hue turn. Everything renders as an hsl() string; hex is only for the readout.

type HSL = { h: number; s: number; l: number }

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v))
const css = (c: HSL) => `hsl(${Math.round(c.h)} ${Math.round(clamp(c.s))}% ${Math.round(clamp(c.l))}%)`

/** HSL → #RRGGBB, for the token readout under each preview. */
function hslToHex(h: number, s: number, l: number): string {
  const sN = clamp(s) / 100
  const lN = clamp(l) / 100
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lN - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

const fmtDeg = (v: number) => `${Math.round(v)}°`
const fmtPct = (v: number) => `${Math.round(v)}%`

// ── Base backgrounds ──────────────────────────────────────────────────────────
// The starting swatches: the site's warm yellow and a near-white "paper", plus a
// spread of other hues to explore. A swatch sets hue + saturation + lightness;
// the sliders fine-tune from there.
type Base = { name: string; h: number; s: number; l: number }
const BASES: Base[] = [
  { name: "Paper", h: 45, s: 14, l: 96 },
  { name: "Butter", h: 48, s: 60, l: 90 },
  { name: "Amber", h: 36, s: 66, l: 88 },
  { name: "Blush", h: 342, s: 55, l: 92 },
  { name: "Coral", h: 14, s: 66, l: 90 },
  { name: "Sky", h: 208, s: 48, l: 92 },
  { name: "Mint", h: 152, s: 42, l: 92 },
  { name: "Lilac", h: 274, s: 42, l: 93 },
]

/**
 * The default value of every control — the single source of truth for both the
 * initial state and the Reset button, so the two can never drift. (Mirrors the
 * DEFAULTS pattern in folder-lab.tsx / type-lab.tsx.) Default = the site's warm
 * "Butter" yellow day, complemented (180°) into a blue night.
 */
const DEFAULTS = {
  baseIndex: 1, // Butter
  hue: 48,
  sat: 60,
  light: 90,
  shade: 6, // lightness step between the page and its cards
  tint: 130, // card saturation as a % of the page's
  nightShift: 180, // day → night hue turn (180° = exact complement)
  nightSat: 34,
  nightLight: 12,
}

// ── Palette derivation ────────────────────────────────────────────────────────
interface Palette {
  bg: HSL
  card: HSL
  raised: HSL
  border: HSL
  text: HSL
  muted: HSL
  accent: HSL
  accentInk: HSL
}

type Config = typeof DEFAULTS

/**
 * Build a full palette for one mode from the shared controls.
 *
 *  • Day keeps the chosen hue; Night turns it by `nightShift` (180° = the exact
 *    complement — yellow → blue, pink → green).
 *  • Cards share the page's hue and step ONE shade toward the surface: darker
 *    than the page in day, lighter at night (surfaces rise toward the light).
 *  • Text and muted ink are the same hue held near the far end of the lightness
 *    range so they stay readable and in-family.
 */
function buildPalette(mode: "day" | "night", c: Config): Palette {
  const dark = mode === "night"
  const h = dark ? (c.hue + c.nightShift) % 360 : c.hue
  const baseS = dark ? c.nightSat : c.sat
  const baseL = dark ? c.nightLight : c.light

  const cardS = clamp(baseS * (c.tint / 100))
  const dir = dark ? 1 : -1 // day: cards darker; night: cards lighter

  const bg: HSL = { h, s: baseS, l: baseL }
  const card: HSL = { h, s: cardS, l: clamp(baseL + dir * c.shade) }
  const raised: HSL = { h, s: cardS, l: clamp(baseL + dir * c.shade * 1.9) }
  const border: HSL = { h, s: clamp(cardS * 0.9), l: clamp(baseL + dir * c.shade * 2.7) }
  const text: HSL = dark
    ? { h, s: clamp(baseS * 0.35, 0, 22), l: 90 }
    : { h, s: clamp(baseS * 0.35, 0, 24), l: 16 }
  const muted: HSL = dark
    ? { h, s: clamp(baseS * 0.3, 0, 18), l: 62 }
    : { h, s: clamp(baseS * 0.3, 0, 20), l: 44 }
  const accent: HSL = { h, s: clamp(Math.max(baseS, 55)), l: dark ? 62 : 58 }
  const accentInk: HSL = accent.l > 55 ? { h, s: 30, l: 12 } : { h, s: 20, l: 96 }

  return { bg, card, raised, border, text, muted, accent, accentInk }
}

// ── UI pieces ─────────────────────────────────────────────────────────────────

/** A titled control card — a light sidebar-coloured panel (matches the other
 *  labs). Publishes `--lab-surface` so slider knobs mask to the card colour. */
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{ "--lab-surface": "var(--color-sidebar)" } as CSSProperties}
      className="flex flex-col gap-4 rounded-2xl bg-(--lab-surface) p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Resets every control on the page to DEFAULTS. */
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

// One hand-drawn base-colour swatch (a rough filled square, matching the Strokes
// colour tiles). The fill is a fixed preset colour, so the sketch memoises once.
const SW = 30
const SW_INSET = 4
const SW_INNER = SW - SW_INSET * 2

function BaseSwatch({
  color,
  selected,
  label,
  seed,
  onClick,
}: {
  color: string
  selected: boolean
  label: string
  seed: number
  onClick: () => void
}) {
  const paths = useMemo(
    () =>
      roughPathInfos(rectPath(SW_INSET, SW_INSET, SW_INNER, SW_INNER), {
        fill: color,
        fillStyle: "solid",
        stroke: "currentColor",
        ...ROUGH_OPTIONS,
        seed,
      }),
    [color, seed],
  )
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-0.5 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "scale-110 ring-2 ring-foreground/70" : "opacity-80 hover:opacity-100",
      )}
    >
      <svg
        aria-hidden="true"
        width={SW}
        height={SW}
        viewBox={`0 0 ${SW} ${SW}`}
        className="block overflow-visible text-foreground"
      >
        <g strokeLinecap="round" strokeLinejoin="round">
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.stroke} fill={p.fill ?? "none"} strokeWidth={p.strokeWidth} />
          ))}
        </g>
      </svg>
    </button>
  )
}

/** A mini UI mock-up painted entirely from a derived palette — the page
 *  background, two cards that echo its hue, ink, and an accent chip. */
function ThemePreview({ p, label }: { p: Palette; label: string }) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ backgroundColor: css(p.bg), border: `1px solid ${css(p.border)}` }}
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span
            style={{ color: css(p.muted) }}
            className="text-[11px] font-semibold uppercase tracking-wider"
          >
            {label}
          </span>
          <span className="size-3.5 rounded-full" style={{ backgroundColor: css(p.accent) }} />
        </div>

        <div>
          <h4 style={{ color: css(p.text), fontFamily: "var(--font-display)" }} className="text-lg leading-tight">
            Background
          </h4>
          <p style={{ color: css(p.muted) }} className="mt-1 text-sm">
            Cards echo the page hue, one shade apart.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ backgroundColor: css(p.card), border: `1px solid ${css(p.border)}` }}
            >
              <div style={{ color: css(p.text) }} className="text-sm font-semibold">
                Card
              </div>
              <div style={{ color: css(p.muted) }} className="mt-0.5 text-xs">
                Same hue · {label === "Night" ? "lighter" : "darker"}
              </div>
              <div className="mt-2.5 h-1.5 rounded-full" style={{ backgroundColor: css(p.raised) }} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{ backgroundColor: css(p.accent), color: css(p.accentInk) }}
          >
            Accent
          </span>
          <span
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ color: css(p.text), border: `1px solid ${css(p.border)}` }}
          >
            Outline
          </span>
        </div>
      </div>
    </div>
  )
}

/** Compact hex readout of the derived tokens under a preview. */
function TokenRow({ p }: { p: Palette }) {
  const toks: Array<[string, HSL]> = [
    ["bg", p.bg],
    ["card", p.card],
    ["raised", p.raised],
    ["text", p.text],
    ["muted", p.muted],
    ["accent", p.accent],
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
      {toks.map(([name, c]) => (
        <div key={name} className="flex items-center gap-1.5" title={name}>
          <span
            className="size-3.5 rounded border border-border"
            style={{ backgroundColor: css(c) }}
          />
          <span className="font-mono text-[11px] text-muted-foreground">{hslToHex(c.h, c.s, c.l)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * ColorLab — a day/night palette generator.
 *
 * Pick a background hue (the site's yellow, a near-white paper, or anything on
 * the wheel); the cards derive from it automatically — same hue, one shade apart
 * — with sliders for the shade step and how much hue the cards carry. The
 * dark-mode ("night") palette is derived parametrically from the light one:
 * night turns the whole hue through the wheel (180° = the exact complement, so a
 * yellow day becomes a blue night, a pink day becomes green), then rebuilds the
 * surfaces and ink at night lightness. Day and night render side by side so the
 * relationship is visible at a glance.
 */
export function ColorLab({ index }: ColorLabProps) {
  const [baseIndex, setBaseIndex] = useState(DEFAULTS.baseIndex)
  const [hue, setHue] = useState(DEFAULTS.hue)
  const [sat, setSat] = useState(DEFAULTS.sat)
  const [light, setLight] = useState(DEFAULTS.light)
  const [shade, setShade] = useState(DEFAULTS.shade)
  const [tint, setTint] = useState(DEFAULTS.tint)
  const [nightShift, setNightShift] = useState(DEFAULTS.nightShift)
  const [nightSat, setNightSat] = useState(DEFAULTS.nightSat)
  const [nightLight, setNightLight] = useState(DEFAULTS.nightLight)

  const reset = () => {
    setBaseIndex(DEFAULTS.baseIndex)
    setHue(DEFAULTS.hue)
    setSat(DEFAULTS.sat)
    setLight(DEFAULTS.light)
    setShade(DEFAULTS.shade)
    setTint(DEFAULTS.tint)
    setNightShift(DEFAULTS.nightShift)
    setNightSat(DEFAULTS.nightSat)
    setNightLight(DEFAULTS.nightLight)
  }

  // Apply a base swatch: set the page hue/saturation/lightness together.
  const applyBase = (i: number) => {
    const b = BASES[i]
    setBaseIndex(i)
    setHue(b.h)
    setSat(b.s)
    setLight(b.l)
  }

  const config: Config = useMemo(
    () => ({ baseIndex, hue, sat, light, shade, tint, nightShift, nightSat, nightLight }),
    [baseIndex, hue, sat, light, shade, tint, nightShift, nightSat, nightLight],
  )
  const day = useMemo(() => buildPalette("day", config), [config])
  const night = useMemo(() => buildPalette("night", config), [config])

  // The complement label, so the copy names the actual night hue live.
  const nightHueName = ((): string => {
    const h = (hue + nightShift) % 360
    const names: Array<[number, string]> = [
      [15, "red"], [45, "orange"], [65, "yellow"], [95, "lime"], [150, "green"],
      [185, "teal"], [210, "cyan"], [250, "blue"], [285, "violet"], [320, "purple"],
      [345, "pink"], [360, "red"],
    ]
    return names.find(([max]) => h < max)?.[1] ?? "blue"
  })()

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* ── PREVIEW — day above night, full-width theme cards, PINNED while the rail scrolls ─ */}
      <FadeInUp i={index} className="min-w-0 flex-1 lg:sticky lg:top-(--content-pt)">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <ThemePreview p={day} label="Day" />
            <TokenRow p={day} />
          </div>
          <div className="flex flex-col gap-3">
            <ThemePreview p={night} label="Night" />
            <TokenRow p={night} />
          </div>
        </div>
      </FadeInUp>

      {/* ── CONTROLS — the rail scrolls beside the pinned preview ──────────── */}
      <FadeInUp i={index + 1} className="w-full shrink-0 lg:w-80">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tune the palette
            </h2>
            <ResetButton onReset={reset} />
          </div>

          <Card title="Background">
            <div role="radiogroup" aria-label="Base background colour" className="flex flex-wrap gap-2">
              {BASES.map((b, i) => (
                <BaseSwatch
                  key={b.name}
                  color={css({ h: b.h, s: b.s, l: b.l })}
                  selected={baseIndex === i}
                  label={b.name}
                  seed={40 + i}
                  onClick={() => applyBase(i)}
                />
              ))}
            </div>
            <RoughSlider label="Hue" value={hue} min={0} max={360} step={1} onChange={(v) => { setHue(v); setBaseIndex(-1) }} format={fmtDeg} seed={11} />
            <RoughSlider label="Saturation" value={sat} min={0} max={100} step={1} onChange={(v) => { setSat(v); setBaseIndex(-1) }} format={fmtPct} seed={12} />
            <RoughSlider label="Lightness" value={light} min={80} max={99} step={1} onChange={(v) => { setLight(v); setBaseIndex(-1) }} format={fmtPct} seed={13} />
          </Card>

          <Card title="Cards">
            <RoughSlider label="Shade step" value={shade} min={0} max={20} step={1} onChange={setShade} format={fmtPct} seed={21} />
            <RoughSlider label="Hue in cards" value={tint} min={40} max={200} step={5} onChange={setTint} format={fmtPct} seed={22} />
            <p className="text-sm text-muted-foreground">
              Cards keep the page hue and step one shade toward the surface —
              darker by day, lighter at night.
            </p>
          </Card>

          <Card title="Night (dark mode)">
            <RoughSlider label="Hue shift" value={nightShift} min={0} max={360} step={5} onChange={setNightShift} format={fmtDeg} seed={31} />
            <RoughSlider label="Saturation" value={nightSat} min={0} max={100} step={1} onChange={setNightSat} format={fmtPct} seed={32} />
            <RoughSlider label="Lightness" value={nightLight} min={5} max={24} step={1} onChange={setNightLight} format={fmtPct} seed={33} />
            <p className="text-sm text-muted-foreground">
              Night turns the day hue through the wheel. At{" "}
              <strong className="font-semibold text-foreground">180°</strong> it lands on the exact
              complement — this day reads as a{" "}
              <strong className="font-semibold text-foreground">{nightHueName}</strong> night. Dial
              toward 210–260° for a violet cast.
            </p>
          </Card>
        </div>
      </FadeInUp>
    </div>
  )
}
