/**
 * INK — the single source of truth for the site's hand-drawn (roughjs) stroke.
 *
 * Every VISIBLE hand-drawn stroke on the real site (home nav folders, sidebar
 * outline, iframe boxes, dividers/separators) reads from here, so there is ONE
 * place to tune the whole site's ink character. Change a value below and it
 * flows everywhere.
 *
 * `seed` is intentionally NOT part of this — it's per-element (each folder/rule
 * carries its own seed for variety) and stays a prop at the call site.
 *
 * The Design-System LABS (Strokes / Type / Colour / Motion) are separate
 * sandboxes with their own local state — they do NOT read from INK.
 */
// Typed with WIDENED (number/boolean) readonly fields — NOT `as const`. A const
// assertion would give literal types (0.5, false, …) that propagate into each
// lab's DEFAULTS object and narrow useState to Dispatch<SetStateAction<0.5>>,
// breaking the slider setters. Widened + readonly = immutable token, usable as a
// default anywhere.
export const INK: Readonly<{
  roughness: number
  bowing: number
  strokeWidth: number
  disableMultiStroke: boolean
  preserveVertices: boolean
}> = {
  /** Waver of the line — 0 = ruler-straight, higher = looser. */
  roughness: 0.5,
  /** How much straight edges bow outward — 0 = no bow. */
  bowing: 0,
  /** Stroke thickness in px (kept constant on screen; non-scaling). */
  strokeWidth: 1,
  /** true = one pass instead of roughjs' default double stroke. */
  disableMultiStroke: false,
  /** true = keep the exact endpoints (less "overshoot" at corners). */
  preserveVertices: true,
}
