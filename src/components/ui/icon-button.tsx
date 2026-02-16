import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface IconButtonProps extends ButtonProps {
  tooltip: React.ReactNode
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ tooltip, tooltipSide = "top", ...props }, ref) => {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button ref={ref} size="icon" {...props} />
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
