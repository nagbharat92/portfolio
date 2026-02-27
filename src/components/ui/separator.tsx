import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Orientation variants for the Separator component.
 * Separator renders a thin line to visually divide content sections.
 *
 * @variant horizontal — Full-width line (h-[1px] w-full). Use between vertically stacked sections.
 * @variant vertical   — Full-height line (h-full w-[1px]). Use between side-by-side columns.
 *                       Requires the parent to have a defined height for the line to be visible.
 *
 * The `decorative` prop controls accessibility:
 *   decorative=true  (default) — Purely visual. Ignored by screen readers.
 *   decorative=false           — Meaningful division. Announced by screen readers as a separator.
 */
const separatorVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical:   "h-full w-[1px]",
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
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : (orientation ?? undefined)}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator, separatorVariants }
