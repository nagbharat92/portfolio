import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Visual variants for the Button component.
 * Button is the primary interactive element for user actions.
 *
 * @variant default     — Filled primary button. Use for the single most important
 *                        action in any given context (submit, confirm, proceed).
 * @variant destructive — For irreversible or dangerous actions (delete, remove, revoke).
 *                        Pair with a confirmation step for actions that cannot be undone.
 * @variant outline     — Secondary action with a visible border. Less prominent than default.
 *                        Use when two actions share equal importance or as a cancel option.
 * @variant secondary   — Muted filled button. For supporting actions that sit alongside a primary.
 * @variant ghost       — No background or border until hovered. For tertiary actions,
 *                        toolbar buttons, or text-adjacent interactive elements.
 * @variant link        — Renders as a hyperlink with underline on hover. For navigation
 *                        or inline text actions within prose.
 *
 * @size default — Standard height (h-9). The baseline for all form layouts.
 * @size sm      — Compact (h-8). For dense UIs, table actions, or secondary toolbars.
 * @size lg      — Large (h-10). For prominent CTAs or touch-optimised surfaces.
 * @size icon    — Square (h-10 w-10). For icon-only buttons. Always pair with a Tooltip.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
