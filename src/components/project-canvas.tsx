import { CanvasActions } from "@/components/canvas-toolbar"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import type { PageNode } from "@/data/pages"

interface ProjectCanvasProps {
  page: PageNode
}

/**
 * ProjectCanvas — renders a page's block array inside a scrollable content column.
 *
 * Layout:
 *   - Desktop: sticky toolbar row at top (hidden on mobile), then scrollable blocks
 *   - Mobile: no toolbar here — it lives in App.tsx's mobile top bar
 *
 * Block spacing:
 *   - Default gap between blocks: mt-10
 *   - stats block gets mt-4 (sits tight below the iframe card)
 */
export function ProjectCanvas({ page }: ProjectCanvasProps) {
  const blocks = page.blocks ?? []

  return (
    <div className="flex h-full flex-col">

      {/* Desktop toolbar — hidden on mobile */}
      <div className="hidden md:flex items-center justify-end px-4 py-3">
        <CanvasActions />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-xl px-6 py-16 md:py-8">
          {blocks.map((block, i) => {
            const isStats = block.type === 'stats'
            return (
              <div key={i} className={i > 0 ? (isStats ? 'mt-4' : 'mt-10') : ''}>
                <BlockRenderer block={block} index={i} />
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
