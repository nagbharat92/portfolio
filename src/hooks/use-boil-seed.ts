import { useEffect, useState } from "react"

/**
 * "Boil" animation — the shared hand-drawn stroke wobble.
 *
 * When a hand-drawn (roughjs) stroke opts in, its seed advances on a timer so the
 * outline re-wobbles frame-to-frame (the classic 2-D "boil"). The cadence MIRRORS
 * the Motion lab's defaults (motion-lab.tsx DEFAULTS: interval 0.2s, 8 looped
 * frames) — hardcoded and kept in sync by hand — so every boiling stroke on the
 * site (dividers, boxes, the slider knob on hover) shares one rhythm.
 */
const BOIL_INTERVAL = 0.2 // seconds each seed is held before the next
const BOIL_FRAMES = 8 // number of seeds in the loop

/**
 * Animated (boiling) strokes draw a touch curvier than the flat site ink
 * (INK.bowing = 0) so the motion reads as lively hand-drawing. Applied to every
 * boiling stroke unless the caller passes an explicit `bowing`.
 */
export const BOIL_BOWING = 0.5

/**
 * While `active`, advances `baseSeed` through BOIL_FRAMES fixed frames on a timer
 * and returns the current seed, so a memoised rough path re-generates each frame.
 * At rest (or under prefers-reduced-motion) it returns `baseSeed` unchanged, so
 * the stroke is static and identical to its un-animated drawing.
 */
export function useBoilSeed(baseSeed: number, active: boolean) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    let f = 0
    const id = window.setInterval(() => {
      f = (f + 1) % BOIL_FRAMES
      setFrame(f)
    }, Math.max(60, Math.round(BOIL_INTERVAL * 1000)))
    return () => window.clearInterval(id)
  }, [active])
  return active ? baseSeed + frame : baseSeed
}
