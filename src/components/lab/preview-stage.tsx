import type { CSSProperties, ReactNode } from "react"
import { CornerFrame } from "@/components/ui/corner-frame"
import { cn } from "@/lib/utils"

interface PreviewStageProps {
  children: ReactNode
  /**
   * Optional top-right control (e.g. a Reset button). It owns that corner, so
   * the registration tick there is dropped to avoid overlapping it.
   */
  action?: ReactNode
  /** Extra classes merged onto the stage (layout, min-height, alignment…). */
  className?: string
}

/**
 * PreviewStage — the canonical surface every lab preview is mounted on.
 *
 * One warm card material (`--surface`, a shade darker than the page — the same
 * colour as the control cards), NO border/stroke, framed by quiet hand-drawn
 * corner ornaments (registration ticks). Reach for this whenever you build a
 * preview so every lab reads as one consistent, framed subject. Generous padding
 * keeps content clear of the corner ticks.
 *
 * It publishes `--lab-surface` (= the stage fill) so nested controls or masks
 * (rough sliders, a folder's cover fill) mask to the surface they sit on.
 */
export function PreviewStage({ children, action, className }: PreviewStageProps) {
  return (
    <div
      style={
        {
          // The one card surface: a shade darker than the page, same warm tint,
          // shared with the control cards. Flips with the theme.
          "--lab-stage": "var(--surface)",
          // Nested masks (slider knobs, a folder cover) match the stage.
          "--lab-surface": "var(--lab-stage)",
        } as CSSProperties
      }
      className={cn("relative w-full rounded-2xl bg-(--lab-stage) p-6", className)}
    >
      <CornerFrame hideTopRight={Boolean(action)} />
      {action ? <div className="absolute right-3 top-3 z-10">{action}</div> : null}
      {children}
    </div>
  )
}
