import type { CSSProperties, ReactNode } from "react"
import { CornerFrame } from "@/components/ui/corner-frame"

/**
 * LabStage — the "stage" the Folder Lab preview is mounted on.
 *
 * The stage shares the ONE card surface (`--surface`) with the control cards, so
 * the whole lab reads as a single warm material — a shade darker than the page,
 * never more yellow. A quiet corner frame (registration ticks) sets it apart as
 * the framed subject rather than louder ink or a different colour.
 *
 * BACKGROUND FILL = THE STAGE. The folder's front cover masks itself with
 * `var(--lab-surface, …)`; the stage publishes `--lab-surface: var(--lab-stage)`
 * so the cover always matches the surface it sits on. The stage fill is a single
 * token, so a future "Background" swatch only has to set `--lab-stage` and the
 * whole preview (folder cover included) follows — one decision, one variable.
 */

export function LabStage({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      style={
        {
          // Stage = the one card surface (--surface): a shade darker than the page,
          // same warm tint. Shared with the control cards so the lab reads as one
          // material. Flips with the theme (a lifted panel in dark).
          "--lab-stage": "var(--surface)",
          // The folder cover masks to the stage, not the page.
          "--lab-surface": "var(--lab-stage)",
        } as CSSProperties
      }
      className="relative flex min-h-64 w-full items-center justify-center rounded-2xl bg-(--lab-stage)"
    >
      <CornerFrame hideTopRight={Boolean(action)} />
      {/* Optional top-right control (e.g. Reset): it owns the top-right corner,
          so CornerTicks drops that one bracket to avoid overlapping it. */}
      {action ? <div className="absolute right-3 top-3 z-10">{action}</div> : null}
      {children}
    </div>
  )
}
