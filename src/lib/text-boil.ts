/**
 * TEXT_BOIL — the site-wide "ink boil" for TEXT.
 *
 * This is the single source of truth for the hand-drawn wobble applied to links
 * (and any future text that opts in) via an SVG displacement filter. It warps
 * the RENDERED PIXELS, so it works on any typeface and keeps the underlying text
 * real (selectable, screen-reader friendly).
 *
 * The one animating filter that reads these values lives in <InkBoilFilter/>
 * (rendered once in App.tsx); the CSS that applies it on hover lives in
 * index.css (the INK BOIL block). Tune these numbers in the Wobble lab
 * (#/text-boil) — the lab's DEFAULTS derive from this token.
 *
 * NOTE: the filter id below is duplicated as a literal string in index.css
 * (`filter: url(#site-ink-boil)`) — CSS can't import a TS constant. Keep them in
 * sync if the id ever changes.
 */
// Widened (number/boolean) readonly fields — NOT `as const` (literal types like
// 3 / false would narrow the lab's useState setters and break the sliders; same
// lesson as src/lib/ink.ts).
export const TEXT_BOIL: Readonly<{
  scale: number
  frequency: number
  octaves: number
  interval: number
  rougher: boolean
}> = {
  /** Displacement amount, in px the pixels are shoved. */
  scale: 3,
  /** feTurbulence baseFrequency — the grain of the wobble (fine → coarse). */
  frequency: 0.015,
  /** feTurbulence numOctaves — how much fine detail the noise carries. */
  octaves: 2,
  /** Seconds each noise seed is held before the next (the boil frame time). */
  interval: 0.2,
  /** true = turbulence (spiky) noise, false = fractalNoise (soft, organic). */
  rougher: false,
}

/** The id of the one global SVG filter every boiling link references. */
export const TEXT_BOIL_FILTER_ID = "site-ink-boil"
