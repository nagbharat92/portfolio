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
  const isHome = page.id === 'home'

  return (
    <div className="relative h-full">

      {/* Desktop toolbar — absolutely positioned top-right, floats above content */}
      <div className="absolute top-(--page-inset) right-(--page-inset) z-10 hidden md:flex items-center">
        <CanvasActions page={page} />
      </div>

      {/* Scrollable content — full height, no clipping */}
      <div className="h-full overflow-y-auto">
        <div
          className={`mx-auto w-full max-w-5xl px-(--content-px) pb-(--content-py-mobile) md:pb-(--content-py) ${
            isHome ? 'pt-(--content-pt-home)' : 'pt-(--content-pt)'
          }`}
        >
          {blocks.map((block, i) => {
            const isIframe = block.type === 'iframe'
            const isStats = block.type === 'stats'
            return (
              <div key={i} className={i > 0 ? (isStats ? 'mt-(--block-gap-tight)' : 'mt-(--block-gap)') : ''}>
                {isIframe ? (
                  <BlockRenderer block={block} index={i} />
                ) : (
                  <div className="mx-auto max-w-2xl">
                    <BlockRenderer block={block} index={i} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
