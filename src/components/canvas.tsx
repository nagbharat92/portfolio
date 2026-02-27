import { useFolderTree } from "@/components/folder-tree"

/**
 * Canvas — main content area of the portfolio.
 *
 * PRD 01 stub: renders the selected page name only.
 * Full implementation in Feature Canvas PRD 02 (Home page) and PRD 03 (Project page).
 */
export function Canvas() {
  const { selectedPage } = useFolderTree()

  if (!selectedPage) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No page selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Selected: <span className="font-medium text-foreground">{selectedPage.name}</span>
      </p>
    </div>
  )
}
