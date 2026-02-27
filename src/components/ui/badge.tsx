import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Visual variants for the Badge component.
 * Badge is a non-interactive label used to communicate status, category, or count.
 * For interactive tags or removable labels, do not use Badge — build a dedicated component.
 *
 * @variant default     — Filled with the primary color. For key status labels, version numbers,
 *                        or counts that need to stand out.
 * @variant secondary   — Muted fill. For informational or neutral labels where prominence
 *                        would compete with surrounding content.
 * @variant destructive — Error or warning state. For labels indicating a problem, failure,
 *                        or item requiring urgent attention.
 * @variant outline     — Border only, transparent background. Lightest visual weight.
 *                        For categorical labels or tags where the badge should recede.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
