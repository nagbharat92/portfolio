import { useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { RotateCcw } from "lucide-react"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { Button } from "@/components/ui/button"
import { CornerFrame } from "@/components/ui/corner-frame"
import { RoughBox } from "@/components/ui/rough-ink"
import { RoughSlider } from "@/components/lab/rough-slider"
import { RoughCheckbox } from "@/components/lab/rough-checkbox"
import { cn } from "@/lib/utils"

interface TypeLabProps {
  index: number
  props?: Record<string, unknown>
}

const fmtPx = (v: number) => `${Math.round(v)}px`
const fmtRem = (v: number) => `${Math.round(v)}rem`
const fmtScale = (v: number) => `${v.toFixed(2)}×`
const fmtNum2 = (v: number) => v.toFixed(2)
const fmtEm = (v: number) =>
  v === 0 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}em`

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Fallbacks kept generic so the brief pre-swap flash never looks jarring; once a
// Google font loads (display=swap), the real face takes over.
const DISPLAY_FALLBACK = "system-ui, sans-serif"
const BODY_FALLBACK = "system-ui, sans-serif"

type FontSpec = { family: string; weights: number[] }

/**
 * A curated pairing. `display`/`body` are Google Fonts families (+ the weights to
 * request); `tagline` is a one-liner for the carousel card; `why` is the human
 * "why this works" note shown beside the specimen.
 */
type Pairing = {
  id: string
  name: string
  display: FontSpec
  body: FontSpec
  tagline: string
  why: string
}

/**
 * The presets, curated to span moods — the site's own voice, editorial serif,
 * modern grotesque, condensed newsstand, poster-bold, and refined serif. All are
 * real Google Fonts families with the requested weights available.
 */
const PAIRINGS: Pairing[] = [
  {
    id: "house",
    name: "House",
    display: { family: "Chango", weights: [400] },
    body: { family: "Cause", weights: [400, 600, 700] },
    tagline: "The site's own voice.",
    why: "A heavy poster display over a friendly, geometric body — the pairing this site already wears. Chango is pure personality up top; Cause stays calm and rounded for the read, so the page feels playful but never hard to follow.",
  },
  {
    id: "editorial",
    name: "Editorial",
    display: { family: "Playfair Display", weights: [400, 700] },
    body: { family: "Source Sans 3", weights: [400, 600, 700] },
    tagline: "Magazine drama, quiet body.",
    why: "Playfair's high-contrast, thick-to-thin serif brings instant editorial elegance to headlines; Source Sans is an even, humanist workhorse that disappears into long reading. Maximum character on top, maximum clarity below — the classic contrast.",
  },
  {
    id: "grotesk",
    name: "Grotesk",
    display: { family: "Space Grotesk", weights: [400, 500, 700] },
    body: { family: "Inter", weights: [400, 600, 700] },
    tagline: "Modern and product-native.",
    why: "Two sans-serifs paired by tone rather than category. Space Grotesk's quirky, slightly technical details give headings a distinct voice, while Inter — engineered for screens — recedes into effortless body text. Cohesive, contemporary, unmistakably digital.",
  },
  {
    id: "newsstand",
    name: "Newsstand",
    display: { family: "Oswald", weights: [500, 700] },
    body: { family: "Lora", weights: [400, 600, 700] },
    tagline: "Condensed heads, serif read.",
    why: "An inversion of the usual order: Oswald's tall, condensed caps stack into punchy, newspaper-style headlines, and Lora answers with a warm, calligraphic serif that's a genuine pleasure to read at length. Structured up top, humane below.",
  },
  {
    id: "poster",
    name: "Poster",
    display: { family: "Anton", weights: [400] },
    body: { family: "Work Sans", weights: [400, 600, 700] },
    tagline: "Big, black, unapologetic.",
    why: "Anton is all impact — tight, ultra-bold, room-filling headlines with nothing to prove. Work Sans is the neutral, hard-working body that lets it shout without the page feeling loud. Contrast at its most extreme: one voice booms, the other keeps order.",
  },
  {
    id: "elegant",
    name: "Elegant",
    display: { family: "Cormorant Garamond", weights: [500, 600, 700] },
    body: { family: "Mulish", weights: [400, 600, 700] },
    tagline: "Refined and understated.",
    why: "Cormorant Garamond is a delicate, high-contrast display serif with real couture in its curves; Mulish is a minimalist sans that stays out of its way. Together they read as considered and premium — luxury that whispers rather than shouts.",
  },
]

/** Strip a family name to safe characters (prevents CSS / URL injection from the
 *  custom-font inputs), collapse whitespace, and trim. */
function sanitizeFamily(name: string): string {
  return name.replace(/[^A-Za-z0-9 -]/g, "").replace(/\s+/g, " ").trim()
}

/** A quoted CSS `font-family` value with a fallback (empty name → just fallback). */
function cssFamily(name: string, fallback: string): string {
  const clean = sanitizeFamily(name)
  return clean ? `"${clean}", ${fallback}` : fallback
}

/** One `family=…` param for the Google Fonts CSS2 API (no weights → regular only). */
function familyParam(family: string, weights: number[]): string {
  const name = sanitizeFamily(family).replace(/ /g, "+")
  if (!name) return ""
  const w = [...new Set(weights)].filter((n) => n > 0).sort((a, b) => a - b)
  return w.length ? `family=${name}:wght@${w.join(";")}` : `family=${name}`
}

/** Build one CSS2 stylesheet URL for a set of families (deduped by family). */
function buildFontsHref(specs: FontSpec[]): string | null {
  const seen = new Set<string>()
  const params: string[] = []
  for (const s of specs) {
    const key = sanitizeFamily(s.family).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    const p = familyParam(s.family, s.weights)
    if (p) params.push(p)
  }
  return params.length ? `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap` : null
}

/** Create/update/remove a keyed <link rel=stylesheet> in <head> for font loading. */
function ensureStylesheet(id: string, href: string | null): void {
  if (typeof document === "undefined") return
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href)
}

/**
 * The default value of every control on the page — the SINGLE source of truth
 * for both the initial state and the Reset button, so the two can never drift.
 * (Mirrors the DEFAULTS pattern in folder-lab.tsx.)
 */
const DEFAULTS = {
  pairingId: "house", // selected preset id, or "custom"
  bodySize: 20, // px — matches the site's --content-body-size
  lineHeight: 1.6, // unitless
  measure: 34, // rem — reading-column max width
  headingScale: 1, // multiplier on the h1/h2/h3 ramp
  tracking: 0, // em — letter-spacing on headings
  headingsUseBody: false, // headings render in the body face, not the display face
}

/**
 * A titled card — a light, sidebar-coloured panel that groups one control
 * section, matching the Strokes (folder-lab) control cards. The card publishes
 * `--lab-surface` so descendant slider knobs mask to the card's own background.
 */
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

/** A small dimmed label used above the figure specimens. */
function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  )
}

/**
 * PairingCard — one curated preset in the carousel. Shows the two family names
 * set in their own faces (a live mini-preview) plus a one-line tagline, wrapped
 * in a hand-drawn rough outline. Selected = filled surface + darker ink.
 */
function PairingCard({
  pairing,
  selected,
  seed,
  onSelect,
}: {
  pairing: Pairing
  selected: boolean
  seed: number
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ "--lab-surface": "var(--color-sidebar)" } as CSSProperties}
      className={cn(
        "group relative flex w-60 shrink-0 snap-start flex-col gap-3 rounded-2xl p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "bg-(--lab-surface)" : "hover:bg-(--lab-surface)/50",
      )}
    >
      <RoughBox
        seed={seed}
        radius={16}
        inset={3}
        className={cn(selected ? "text-foreground" : "text-border group-hover:text-muted-foreground")}
      />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {pairing.name}
      </span>
      <div className="flex flex-col gap-1">
        <span
          style={{ fontFamily: cssFamily(pairing.display.family, DISPLAY_FALLBACK) }}
          className="text-2xl leading-tight text-foreground"
        >
          {pairing.display.family}
        </span>
        <span
          style={{ fontFamily: cssFamily(pairing.body.family, BODY_FALLBACK) }}
          className="text-base leading-tight text-foreground/70"
        >
          {pairing.body.family}
        </span>
      </div>
      <span className="text-sm leading-snug text-muted-foreground">{pairing.tagline}</span>
    </button>
  )
}

/** A hand-drawn text field — a borderless input inside a rough outline box. */
function RoughField({
  label,
  value,
  placeholder,
  seed,
  onChange,
  onSubmit,
}: {
  label: string
  value: string
  placeholder: string
  seed: number
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="relative block text-border">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onSubmit()
            }
          }}
          className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:text-foreground"
        />
        <RoughBox seed={seed} radius={10} inset={2} className="text-border" />
      </span>
    </label>
  )
}

/**
 * CustomCard — the last card in the carousel: type any two Google Fonts families
 * and apply them. Selected when the active pairing is "custom".
 */
function CustomCard({
  selected,
  displayValue,
  bodyValue,
  seed,
  onDisplayChange,
  onBodyChange,
  onApply,
}: {
  selected: boolean
  displayValue: string
  bodyValue: string
  seed: number
  onDisplayChange: (v: string) => void
  onBodyChange: (v: string) => void
  onApply: () => void
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-label="Custom pairing"
      style={{ "--lab-surface": "var(--color-sidebar)" } as CSSProperties}
      className={cn(
        "relative flex w-72 shrink-0 snap-start flex-col gap-3 rounded-2xl p-5",
        selected && "bg-(--lab-surface)",
      )}
    >
      <RoughBox seed={seed} radius={16} inset={3} className={cn(selected ? "text-foreground" : "text-border")} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Custom</span>
      <RoughField
        label="Display font"
        value={displayValue}
        placeholder="e.g. Bricolage Grotesque"
        seed={seed + 1}
        onChange={onDisplayChange}
        onSubmit={onApply}
      />
      <RoughField
        label="Body font"
        value={bodyValue}
        placeholder="e.g. Newsreader"
        seed={seed + 2}
        onChange={onBodyChange}
        onSubmit={onApply}
      />
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-xs text-muted-foreground">Any family on Google Fonts.</span>
        <Button size="sm" variant="outline" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

/**
 * Track a horizontal scroller so the carousel can fade whichever edge still has
 * cards out of view. The fade PERSISTS while content is hidden that side (so the
 * cards never hard-clip) and eases in / out via the scrims' opacity transition
 * as you scroll to and from each end. Returns the ref + two booleans for the
 * leading / trailing edge scrims.
 */
function useCarouselFade<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      // Tolerance clears the leading/trailing scroll padding, so snap-mandatory
      // resting at that offset doesn't read as "scrolled" (no fade at the ends).
      const start = el.scrollLeft > 8
      const end = el.scrollLeft < el.scrollWidth - el.clientWidth - 8
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", measure)
      ro.disconnect()
    }
  }, [])

  return { ref, showStart: edges.start, showEnd: edges.end }
}

/**
 * TypeLab — a type-specimen playground for judging font pairings.
 *
 * PHASE 1: tests the CURRENT site pairing (Chango display + Cause body). The
 * specimen is a realistic article that exercises the whole hierarchy — title,
 * section headings, body copy, links, lists, a pull-quote, figures and UI text
 * — so a pairing can be judged the way it will actually be read. A sticky
 * controls rail tunes the levers that matter most (size, leading, measure,
 * heading scale, tracking, and whether headings use the display or body face).
 *
 * The fonts are applied via SCOPED custom properties on the specimen root
 * (`--type-display` / `--type-body`, defaulting to the site's `--font-display` /
 * `--font-sans`), so PHASE 2 only has to swap those two variables to test new
 * faces — the global type ramp is never touched.
 */
export function TypeLab({ index }: TypeLabProps) {
  const [pairingId, setPairingId] = useState(DEFAULTS.pairingId)
  // Applied custom families (sanitized); the drafts are what the inputs hold.
  const [customDisplay, setCustomDisplay] = useState("")
  const [customBody, setCustomBody] = useState("")
  const [displayDraft, setDisplayDraft] = useState("")
  const [bodyDraft, setBodyDraft] = useState("")

  const [bodySize, setBodySize] = useState(DEFAULTS.bodySize)
  const [lineHeight, setLineHeight] = useState(DEFAULTS.lineHeight)
  const [measure, setMeasure] = useState(DEFAULTS.measure)
  const [headingScale, setHeadingScale] = useState(DEFAULTS.headingScale)
  const [tracking, setTracking] = useState(DEFAULTS.tracking)
  const [headingsUseBody, setHeadingsUseBody] = useState(DEFAULTS.headingsUseBody)

  // Fade the carousel's edges while actively scrolling (eases in on scroll).
  const { ref: carouselRef, showStart, showEnd } = useCarouselFade<HTMLDivElement>()

  const reset = () => {
    setPairingId(DEFAULTS.pairingId)
    setCustomDisplay("")
    setCustomBody("")
    setDisplayDraft("")
    setBodyDraft("")
    setBodySize(DEFAULTS.bodySize)
    setLineHeight(DEFAULTS.lineHeight)
    setMeasure(DEFAULTS.measure)
    setHeadingScale(DEFAULTS.headingScale)
    setTracking(DEFAULTS.tracking)
    setHeadingsUseBody(DEFAULTS.headingsUseBody)
  }

  // Preload every preset family once so the carousel previews render in-font and
  // switching a pairing is instant.
  useEffect(() => {
    ensureStylesheet("type-lab-fonts", buildFontsHref(PAIRINGS.flatMap((p) => [p.display, p.body])))
  }, [])

  // Load custom families on demand. Weights omitted (regular only) so ANY family
  // the user types loads reliably; heavier weights faux-synthesize.
  useEffect(() => {
    const specs: FontSpec[] = []
    if (customDisplay) specs.push({ family: customDisplay, weights: [] })
    if (customBody) specs.push({ family: customBody, weights: [] })
    ensureStylesheet("type-lab-custom", buildFontsHref(specs))
  }, [customDisplay, customBody])

  const applyCustom = () => {
    setCustomDisplay(sanitizeFamily(displayDraft))
    setCustomBody(sanitizeFamily(bodyDraft))
    setPairingId("custom")
  }

  // Resolve the active pairing → the two families + the "why it works" note.
  const isCustom = pairingId === "custom"
  const active = PAIRINGS.find((p) => p.id === pairingId)
  const displayFamily = isCustom ? customDisplay : active?.display.family ?? ""
  const bodyFamily = isCustom ? customBody : active?.body.family ?? ""
  const activeName = isCustom ? "Custom" : active?.name ?? ""
  const whyText = isCustom
    ? "Your own pairing. Type any two families from the Google Fonts library, hit Apply, and judge them against the full specimen — headings, body, links, lists and all."
    : active?.why ?? ""

  // Scoped typographic variables — everything in the specimen reads from these,
  // so one place drives the whole preview without touching global styles.
  const specimenStyle = {
    "--type-display": headingsUseBody ? cssFamily(bodyFamily, BODY_FALLBACK) : cssFamily(displayFamily, DISPLAY_FALLBACK),
    "--type-body": cssFamily(bodyFamily, BODY_FALLBACK),
    "--type-body-size": `${bodySize}px`,
    "--type-leading": `${lineHeight}`,
    "--type-measure": `${measure}rem`,
    "--type-heading-scale": `${headingScale}`,
    "--type-tracking": `${tracking}em`,
    // The one card surface (--surface), matching the Strokes stage + control cards.
    "--lab-stage": "var(--surface)",
  } as CSSProperties

  const bodyStyle: CSSProperties = {
    fontFamily: "var(--type-body)",
    fontSize: "var(--type-body-size)",
    lineHeight: "var(--type-leading)",
  }
  const heading = (rem: string): CSSProperties => ({
    fontFamily: "var(--type-display)",
    fontSize: `calc(${rem} * var(--type-heading-scale))`,
    letterSpacing: "var(--type-tracking)",
    lineHeight: 1.1,
  })

  return (
    <div className="flex w-full flex-col gap-8">
      {/* ── PAIRINGS — scroll through curated presets, then Custom ─────────── */}
      <FadeInUp i={index} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pairings</h2>
          <span className="text-xs text-muted-foreground/70">Scroll to explore →</span>
        </div>
        <div className="relative">
          <div
            ref={carouselRef}
            role="radiogroup"
            aria-label="Font pairings"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pt-1 pb-4 [scrollbar-width:thin]"
          >
            {PAIRINGS.map((p, i) => (
              <PairingCard
                key={p.id}
                pairing={p}
                selected={!isCustom && pairingId === p.id}
                seed={40 + i}
                onSelect={() => setPairingId(p.id)}
              />
            ))}
            <CustomCard
              selected={isCustom}
              displayValue={displayDraft}
              bodyValue={bodyDraft}
              seed={60}
              onDisplayChange={setDisplayDraft}
              onBodyChange={setBodyDraft}
              onApply={applyCustom}
            />
          </div>
          {/* Edge scrims — ease in only while scrolling, on the side that still
              has cards to reveal (fade to the page bg, like the Strokes seam). */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent transition-opacity duration-300",
              showStart ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent transition-opacity duration-300",
              showEnd ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </FadeInUp>

      {/* ── SPECIMEN + RAIL ────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* ── SPECIMEN — the reading column, on a recessed stage ─────────────── */}
      <FadeInUp i={index + 1} className="min-w-0 flex-1">
        <div
          style={specimenStyle}
          className="relative rounded-2xl bg-(--lab-stage) px-6 py-8 sm:px-10 sm:py-12"
        >
          <CornerFrame />
          <div style={{ maxWidth: "var(--type-measure)" }} className="mx-auto w-full">
            {/* Pairing meta — the two faces being tested */}
            <p className="mb-8 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Headings · {(headingsUseBody ? bodyFamily : displayFamily) || "—"}
              <span className="px-2 text-muted-foreground/50">/</span>
              Body · {bodyFamily || "—"}
            </p>

            <h1 style={heading("2.5rem")} className="text-foreground">
              Pairing type with intent
            </h1>

            <p
              style={{ ...bodyStyle, fontSize: "calc(var(--type-body-size) * 1.2)" }}
              className="mt-5 text-muted-foreground"
            >
              A pairing works when the display face and the body face disagree just
              enough — enough contrast to signal hierarchy, enough harmony to feel
              like a single voice.
            </p>

            <h2 style={heading("1.5rem")} className="mt-12 text-foreground">
              Reading at length
            </h2>
            <p style={bodyStyle} className="mt-4 text-foreground/80">
              This is body copy at the reading size. Judge it by the paragraph, not
              the letter: watch the rhythm of the lines, the colour of the block, and
              how the eye returns to the left margin. Emphasis should feel calm — a{" "}
              <strong className="font-semibold text-foreground">bold phrase</strong>{" "}
              here, an <em className="italic">italic aside</em> there — and an{" "}
              <a
                href="#"
                className="underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
              >
                inline link
              </a>{" "}
              should read as part of the sentence, not a speed bump. Even{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                inline code
              </code>{" "}
              has to sit comfortably on the line.
            </p>

            <h3 style={heading("1.125rem")} className="mt-9 text-foreground">
              Where the two voices meet
            </h3>
            <p style={bodyStyle} className="mt-3 text-foreground/80">
              The seam between a heading and the paragraph below it is where a pairing
              is won or lost. Too similar and the hierarchy collapses; too different
              and the page feels assembled from spare parts.
            </p>

            <p className="mt-5">
              <a
                href="#"
                style={bodyStyle}
                className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-muted-foreground"
              >
                Read the full type system →
              </a>
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <ul
                style={bodyStyle}
                className="list-disc space-y-1.5 pl-6 text-foreground/80 marker:text-muted-foreground"
              >
                <li>Contrast between the two faces</li>
                <li>Legibility of the body at reading size</li>
                <li>How links and emphasis behave in text</li>
              </ul>
              <ol
                style={bodyStyle}
                className="list-decimal space-y-1.5 pl-6 text-foreground/80 marker:text-muted-foreground"
              >
                <li>Set the body first</li>
                <li>Choose a display face that argues with it</li>
                <li>Tune scale, leading and measure last</li>
              </ol>
            </div>

            <blockquote
              style={{ ...bodyStyle, fontSize: "calc(var(--type-body-size) * 1.15)" }}
              className="mt-10 border-l-2 border-border pl-5 italic text-foreground/90"
            >
              “Type is a voice. A pairing is a conversation — and the reader should
              never notice the two speakers taking turns.”
            </blockquote>

            {/* Figures — display vs body numerals sit very differently */}
            <div className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
              <div>
                <MetaLabel>Display figures</MetaLabel>
                <span style={heading("1.5rem")} className="text-foreground">
                  0123456789
                </span>
              </div>
              <div>
                <MetaLabel>Body figures</MetaLabel>
                <span style={bodyStyle} className="text-foreground">
                  0123456789 · 2026 · $1,240 · 3.14
                </span>
              </div>
            </div>

            {/* UI text — the pairing living inside interface chrome */}
            <div className="mt-10">
              <MetaLabel>Interface</MetaLabel>
              <div style={{ fontFamily: "var(--type-body)" }} className="flex flex-wrap items-center gap-3">
                <Button>Primary action</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="link" className="px-0">
                  Text link
                </Button>
              </div>
            </div>

            <p style={bodyStyle} className="mt-10 text-sm text-muted-foreground">
              Caption and metadata — the smallest text on the page. If a pairing
              survives here, at the bottom of the hierarchy, it will survive anywhere.
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* ── CONTROLS — a sticky rail beside the specimen ──────────────────── */}
      <FadeInUp i={index + 2} className="w-full shrink-0 lg:sticky lg:top-(--content-pt) lg:w-80">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tune the pairing
            </h2>
            <ResetButton onReset={reset} />
          </div>

          <Card title="Why it works">
            <p className="text-sm leading-relaxed text-foreground/80">
              <span className="font-semibold text-foreground">{activeName}. </span>
              {whyText}
            </p>
          </Card>

          <Card title="Body">
            <RoughSlider label="Body size" value={bodySize} min={14} max={28} step={1} onChange={setBodySize} format={fmtPx} seed={11} />
            <RoughSlider label="Line height" value={lineHeight} min={1.2} max={2} step={0.05} onChange={setLineHeight} format={fmtNum2} seed={12} />
            <RoughSlider label="Measure" value={measure} min={24} max={48} step={1} onChange={setMeasure} format={fmtRem} seed={13} />
          </Card>

          <Card title="Headings">
            <RoughSlider label="Heading scale" value={headingScale} min={0.75} max={1.5} step={0.05} onChange={setHeadingScale} format={fmtScale} seed={21} />
            <RoughSlider label="Tracking" value={tracking} min={-0.03} max={0.08} step={0.005} onChange={setTracking} format={fmtEm} seed={22} />
            <div className="pt-1">
              <RoughCheckbox label="Headings use body font" checked={headingsUseBody} onChange={setHeadingsUseBody} seed={31} />
            </div>
          </Card>
        </div>
      </FadeInUp>
      </div>
    </div>
  )
}
