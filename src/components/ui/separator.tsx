import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { RoughLine } from "@/components/ui/rough-ink"

/**
 * Orientation variants for the Separator component.
 * Separator renders a hand-drawn (sketchy) line to visually divide content sections.
 *
 * @variant horizontal — Full-width rough line. Use between vertically stacked sections.
 * @variant vertical   — Full-height rough line. Use between side-by-side columns.
 *                       Requires the parent to have a defined height for the line to be visible.
 *
 * The `decorative` prop controls accessibility:
 *   decorative=true  (default) — Purely visual. Ignored by screen readers.
 *   decorative=false           — Meaningful division. Announced by screen readers as a separator.
 */
const separatorVariants = cva(
  "shrink-0 text-muted-foreground",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical:   "h-full",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean
  /** Fixed roughjs seed so the sketchy line never re-wobbles. */
  seed?: number
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, seed, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : (orientation ?? undefined)}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    >
      <RoughLine orientation={orientation ?? "horizontal"} seed={seed} />
    </div>
  )
)
Separator.displayName = "Separator"

export { Separator, separatorVariants }
