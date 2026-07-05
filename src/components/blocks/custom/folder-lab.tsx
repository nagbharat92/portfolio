import { useState } from "react"
import { RoughFolder } from "@/components/rough-folder"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughDivider } from "@/components/lab/rough-divider"
import { RoughSlider } from "@/components/lab/rough-slider"

interface FolderLabProps {
  index: number
  props?: Record<string, unknown>
}

const MIN_SIZE = 0.5
const MAX_SIZE = 2.5
const DEFAULT_SIZE = 1.5

/**
 * FolderLab — an isolated stage + controls for the hand-drawn RoughFolder.
 *
 * Renders the real home-page folder on its own so its hover / focus open
 * animation can be explored, alongside a growing set of hand-drawn ("squiggly")
 * controls (see src/components/lab/*) for tweaking it. First control: a size
 * slider that scales the folder. All lab UI shares the folder's ink style.
 */
export function FolderLab({ index }: FolderLabProps) {
  const [size, setSize] = useState(DEFAULT_SIZE)

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Folder stage — fixed height so scaling the folder up doesn't shove the
          controls around (CSS transforms don't reflow). */}
      <div className="flex min-h-[24rem] w-full items-center justify-center">
        <div style={{ transform: `scale(${size})` }}>
          <RoughFolder index={index} seed={7} label="Folder" />
        </div>
      </div>

      <FadeInUp i={index + 1}>
        <p className="text-center text-sm text-muted-foreground">
          Hover or focus the folder to play the open animation.
        </p>
      </FadeInUp>

      <FadeInUp i={index + 2}>
        <RoughDivider />
      </FadeInUp>

      <FadeInUp i={index + 3}>
        <RoughSlider
          label="Folder size"
          value={size}
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={0.1}
          onChange={setSize}
          format={(v) => `${v.toFixed(1)}\u00d7`}
        />
      </FadeInUp>
    </div>
  )
}
