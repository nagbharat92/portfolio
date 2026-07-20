import * as React from "react"
import rough from "roughjs"

import { useSidebar } from "@/components/ui/sidebar"
import { useBoilSeed } from "@/hooks/use-boil-seed"
import { INK } from "@/lib/ink"
import { cn } from "@/lib/utils"

/**
 * RoughMenuButton — the mobile "open the menu" affordance, drawn as a
 * high-contrast hand-drawn INK STAMP.
 *
 * Why it exists: the old trigger used a pale `bg-sidebar` chip that blended into
 * the cream page (an accessibility/visibility problem). Instead of a shadow
 * (banned on this site) or frosted glass (unreliable over a flat page), this
 * flips the values — a solid foreground-ink slab with a sketchy hamburger in the
 * page colour, so it reads like a little rubber stamp / wax seal. Near-black on
 * cream (and its inverse in dark mode) is unambiguously high-contrast, and the
 * hand-drawn bars keep it on-brand with the rest of the site's ink line-art.
 *
 * The three bars are real roughjs strokes drawn with the menu's OWN tuned ink
 * (BAR_ROUGHNESS / BAR_BOWING / BAR_STROKE_WIDTH — dialled in on the Motion lab
 * and applied identically to BOTH the rest and hover states), so they read a
 * touch looser/heavier than the flat site INK to stay legible on the stamp.
 * On hover/focus TWO things happen together: the bars "BOIL" — the seed advances
 * on the shared cadence (useBoilSeed) so the outlines re-wobble frame-to-frame,
 * the same animation used for the dividers, boxes and slider knobs (the ink
 * character itself is unchanged from rest — only the seed moves) — AND the top /
 * bottom bars SPLAY OPEN (a little "bloom open" gesture, CSS transform in the
 * `.rough-menu` rules in index.css). The whole stamp also presses in on tap. All
 * motion honours `prefers-reduced-motion` (the boil hook no-ops under it and the
 * CSS transforms are disabled).
 *
 * GOTCHA (why each bar is its OWN <svg>): CSS transforms on an SVG <g> inside a
 * shared <svg> do NOT reliably render here — only transforms on a standalone
 * <svg> (an HTML replaced element) do. So each bar is a separate <svg>: the splay
 * animates those, and the boil regenerates each bar's path `d`. Each bar keeps
 * its own seed so the three wobble differently.
 */

const generator = rough.generator()

// Menu-specific ink, chosen on the Motion lab and used for BOTH rest and hover
// (only the seed animates on hover). Independent of the site-wide INK token.
/** Line waver — looser than INK so the little glyph reads as hand-drawn. */
const BAR_ROUGHNESS = 1.2
/** How much the bars bow — same in both states (the boil only moves the seed). */
const BAR_BOWING = 2
/** Stroke weight of the bars, heavier than INK so the glyph stays legible. */
const BAR_STROKE_WIDTH = 1.5

/** A single hand-drawn horizontal bar → SVG `d` strings (18×6 viewBox). */
function barPaths(seed: number): string[] {
  return generator
    .toPaths(
      generator.line(1.5, 3, 16.5, 3, {
        ...INK,
        roughness: BAR_ROUGHNESS,
        bowing: BAR_BOWING,
        seed,
      }),
    )
    .map((p) => p.d)
}

/** Fixed per-bar seeds so the three bars wobble differently at rest. */
const BAR_SEEDS = [1, 2, 3]

/** Per-bar CSS modifiers driving the hover splay (top/bottom bars only move). */
const BAR_MODIFIERS = [
  "rough-menu__bar--top",
  "rough-menu__bar--mid",
  "rough-menu__bar--bot",
]

export const RoughMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  const [active, setActive] = React.useState(false)

  // 0 at rest; cycles 0..N-1 on the shared boil cadence while hovered/focused.
  // Only the seed moves — the ink params are identical in both states.
  const boilFrame = useBoilSeed(0, active)

  const bars = React.useMemo(
    () => BAR_SEEDS.map((seed) => barPaths(seed + boilFrame)),
    [boilFrame]
  )

  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      aria-label="Open menu"
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        setActive(true)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setActive(false)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        setActive(true)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        setActive(false)
      }}
      className={cn(
        "rough-menu group relative flex size-10 items-center justify-center rounded-xl",
        "bg-foreground text-background outline-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      <span className="flex flex-col items-center gap-0.5">
        {bars.map((ds, bar) => (
          <svg
            key={bar}
            aria-hidden="true"
            width={18}
            height={6}
            viewBox="0 0 18 6"
            className={cn("rough-menu__bar block overflow-visible", BAR_MODIFIERS[bar])}
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={BAR_STROKE_WIDTH}
              strokeLinecap="round"
            >
              {ds.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </svg>
        ))}
      </span>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
})
RoughMenuButton.displayName = "RoughMenuButton"
