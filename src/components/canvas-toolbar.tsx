import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFolderTree } from "@/components/folder-tree"
import type { IframeBlock } from "@/data/pages"

/**
 * CanvasActions — icon button group for the current page.
 *
 * Rendered twice: inside ProjectCanvas (desktop) and in App.tsx mobile toolbar.
 * Responsive visibility is controlled by the parent — this component is display-agnostic.
 */
export function CanvasActions() {
  const { selectedPage } = useFolderTree()

  const iframeBlock = selectedPage?.blocks?.find(
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
