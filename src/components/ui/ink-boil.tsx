import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { TEXT_BOIL, TEXT_BOIL_FILTER_ID } from "@/lib/text-boil"
import { cn } from "@/lib/utils"

/**
 * Track prefers-reduced-motion so the boil holds still for users who opt out of
 * motion (the CSS also gates the filter off entirely for them; stopping the
 * timer here just avoids needless work).
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

/**
 * InkBoilFilter — the ONE global SVG filter that every boiling link references.
 *
 * Render it exactly once, high in the tree (App.tsx). It's a hidden, zero-size,
 * non-interactive <svg> holding a `feTurbulence` → `feDisplacementMap` filter
 * whose noise `seed` advances on a timer, so the filter output "boils". Links
 * reference it via CSS `filter: url(#site-ink-boil)` on hover (see the INK BOIL
 * block in index.css); when nothing references it, animating the seed costs
 * nothing (no consumers → no repaint), just a tiny isolated re-render here.
 *
 * All params come from the TEXT_BOIL token — the single source of truth shared
 * with the Wobble lab.
 */
export function InkBoilFilter() {
  const reduced = usePrefersReducedMotion()
  const [seed, setSeed] = useState(1)

  useEffect(() => {
    if (reduced) return
    const ms = Math.max(60, Math.round(TEXT_BOIL.interval * 1000))
    const t = window.setInterval(() => {
      setSeed((s) => (s % 500) + 1)
    }, ms)
    return () => window.clearInterval(t)
  }, [reduced])

  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0">
      <defs>
        <filter
          id={TEXT_BOIL_FILTER_ID}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type={TEXT_BOIL.rougher ? "turbulence" : "fractalNoise"}
            baseFrequency={TEXT_BOIL.frequency}
            numOctaves={TEXT_BOIL.octaves}
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={TEXT_BOIL.scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

/**
 * InkBoilText — wraps text so it "boils" (the hand-drawn ink wobble) the whole
 * time it's on screen, via the global filter. Use it for TRANSIENT text that is
 * only shown briefly and should animate while visible — e.g. tooltip labels.
 *
 * (For LINKS, prefer the hover classes `.ink-boil` / `.ink-boil-parent` instead,
 * which boil only on hover/focus — see the INK BOIL block in index.css.)
 *
 * The underlying `.ink-boil-on` rule is gated to real-hover, motion-OK
 * environments, so touch and prefers-reduced-motion users get plain, crisp text.
 */
export function InkBoilText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("ink-boil-on inline-block", className)}>{children}</span>
}
