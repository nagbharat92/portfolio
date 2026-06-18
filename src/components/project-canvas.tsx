import { BlockRenderer } from "@/components/blocks/block-renderer"
import type { PageNode } from "@/data/pages"

interface ProjectCanvasProps {
  page: PageNode
}

/**
 * ProjectCanvas — renders a page's block array inside a scrollable content column.
 *
 * Layout:
 *   - A single scrollable content column; blocks are centered with a max width.
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

      {/* Scrollable content — full height, no clipping */}
      <div className="h-full overflow-y-auto">
        <div
          className={`mx-auto w-full max-w-5xl px-(--content-px) pb-(--content-py-mobile) lg:pb-(--content-py) ${
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
