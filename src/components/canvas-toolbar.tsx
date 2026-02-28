import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFolderTree } from "@/components/folder-tree"
import type { IframeBlock, PageNode } from "@/data/pages"

interface CanvasActionsProps {
  /** When provided, toolbar reads blocks from this page instead of context.
   *  Pass this inside AnimatePresence-managed trees so the toolbar stays
   *  stable during exit animations and does not flicker. */
  page?: PageNode
}

/**
 * CanvasActions — icon button group for the current page.
 *
 * Rendered twice:
 *   - Inside ProjectCanvas (desktop) — receives `page` prop to stay stable during exit.
 *   - In App.tsx mobile toolbar — no prop, reads from context (outside AnimatePresence).
 */
export function CanvasActions({ page }: CanvasActionsProps = {}) {
  const { selectedPage } = useFolderTree()
  const resolvedPage = page ?? selectedPage

  const iframeBlock = resolvedPage?.blocks?.find(
    (b): b is IframeBlock => b.type === 'iframe'
  )

  if (!iframeBlock) return null

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild>
            <a
              href={iframeBlock.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open project in new tab"
            >
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Open in new tab</TooltipContent>
      </Tooltip>
    </div>
  )
}
