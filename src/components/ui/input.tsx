import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Size variants for the Input component.
 * Input sizes are designed to match Button sizes exactly so that pairing
 * an Input and a Button in the same row always produces consistent heights
 * without custom overrides.
 *
 * @size sm      — Compact height (h-7). Pair with <Button size="sm">.
 *                 For dense forms, filter bars, or inline editing contexts.
 * @size default — Standard height (h-9). Pairs with default Button.
 *                 The baseline for all form layouts.
 * @size lg      — Large height (h-11). Pair with <Button size="lg">.
 *                 For prominent search inputs or touch-optimised forms.
 *
 * Note: The native HTML `size` attribute (character width) is intentionally
 * omitted from InputProps to avoid a type conflict with this size variant.
 * Use CSS width utilities (w-full, w-48, etc.) to control input width instead.
 */
const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm:      "h-7 px-2 py-1 text-xs shadow-none",
        default: "h-9 px-3 py-1 text-sm shadow-sm",
        lg:      "h-11 px-4 py-2 text-base shadow-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
