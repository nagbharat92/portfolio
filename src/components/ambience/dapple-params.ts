/**
 * dapple-params.ts — the tweakable parameters for the procedural leaf-dapple.
 *
 * Kept in its own (React-free) module so both the shader canvas and the drop-in
 * <AmbienceLayer/> share one type + one set of defaults, and so the experiment
 * page's control rail can drive the same shape.
 */
export interface DappleParams {
  // ── Canopy (noise field) ──
  /** Base noise frequency — smaller = bigger, looser clumps. */
  scale: number
  /** fBm octaves — more = finer leaf detail. */
  octaves: number
  /** Domain-warp strength — bends the field into organic, non-uniform clumps. */
  warp: number

  // ── Light gaps (thresholding) ──
  /** Where the light/shadow split falls — higher = denser canopy (more shadow). */
  density: number
  /** Edge softness of the gaps. */
  softness: number
  /** Contrast around the midpoint — punches the gaps in or out. */
  contrast: number

  // ── Drift (breeze) ──
  /** How fast the field drifts. */
  driftSpeed: number
  /** Drift direction, in degrees. */
  driftAngle: number

  // ── Blend (how it lands on the page) ──
  /** Shadow opacity (light theme; dark theme is boosted internally). */
  strength: number
  /** CSS blur on the overlay (px) — gauzy softening. */
  blur: number
  /** How far the corner fade reaches across the page. */
  coverage: number
}

export const DEFAULT_DAPPLE: DappleParams = {
  scale: 3.2,
  octaves: 6,
  warp: 0.9,
  density: 0.5,
  softness: 0.13,
  contrast: 1.75,
  driftSpeed: 0.25,
  driftAngle: 40,
  strength: 0.42,
  blur: 2,
  coverage: 1,
}
