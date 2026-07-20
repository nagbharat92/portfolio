import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { FolderOpen, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import {
  type SidebarNode,
  type PageNode,
  sidebarData,
  findPage,
} from "@/data/pages"

// ─── Depth padding ────────────────────────────────────────────────────────────
// Computed from spacing tokens: base indent + depth × step.
// Eliminates the static lookup table and scales to any depth.

// ─── FolderItem ───────────────────────────────────────────────────────────────

function FolderItem({
  node,
  depth,
  selectedId,
  select,
}: {
  node: SidebarNode
  depth: number
  selectedId: string | null
  select: (id: string) => void
}) {
  const indentStyle = {
    paddingLeft: `calc(var(--tree-indent-base) + ${depth} * var(--tree-indent-step))`,
  }

  // Folders are always-expanded grouping headers — not interactive, no toggle.
  // Their children always render, indented one step in.
  if (node.type === 'folder') {
    return (
      <li>
        <div
          className="flex w-full items-center gap-(--tree-item-gap) rounded-md px-(--tree-item-px) py-(--tree-item-py) text-sm text-sidebar-foreground"
          style={indentStyle}
        >
          <FolderOpen className="size-4 shrink-0 text-sidebar-foreground/70" />
          <span className="truncate">{node.name}</span>
        </div>

        <ul className="flex flex-col gap-0.5">
          {node.children.map((child) => (
            <FolderItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              select={select}
            />
          ))}
        </ul>
      </li>
    )
  }

  // Pages are the interactive leaves.
  const isSelected = selectedId === node.id
  const PageIcon = node.icon ?? File

  return (
    <li>
      <button
        onClick={() => select(node.id)}
        className={cn(
          "flex w-full items-center gap-(--tree-item-gap) rounded-md px-(--tree-item-px) py-(--tree-item-py) text-sm text-sidebar-foreground",
          "transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          "cursor-pointer",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
        style={indentStyle}
      >
        <PageIcon className="size-4 shrink-0 text-sidebar-foreground/70" />
        <span className="truncate">{node.name}</span>
      </button>
    </li>
  )
}

// ─── Context ──────────────────────────────────────────────────────────────────

type FolderTreeContextValue = {
  selectedId: string | null
  selectedPage: PageNode | null
  select: (id: string) => void
}

const FolderTreeContext = createContext<FolderTreeContextValue | null>(null)

/** Reads the page id from the URL hash. Returns 'home' as fallback. */
function getInitialPageId(): string {
  const hash = window.location.hash // e.g. "#/experiment-1"
  const id = hash.replace(/^#\//, '').trim()
  return id && findPage(sidebarData, id) ? id : 'home'
}

export function FolderTreeProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(() => getInitialPageId())

  const [selectedPage, setSelectedPage] = useState<PageNode | null>(() =>
    findPage(sidebarData, getInitialPageId())
  )

  const select = useCallback((id: string) => {
    setSelectedId(id)
    setSelectedPage(findPage(sidebarData, id))
    window.location.hash = `/${id}`
  }, [])

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace(/^#\//, '').trim()
      const id = hash && findPage(sidebarData, hash) ? hash : 'home'
      setSelectedId(id)
      setSelectedPage(findPage(sidebarData, id))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <FolderTreeContext.Provider value={{ selectedId, selectedPage, select }}>
      {children}
    </FolderTreeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Consume the FolderTree context.
 * Use this in any component that needs to read or respond to the selected page.
 * Must be used inside <FolderTreeProvider>.
 */
export function useFolderTree() {
  const ctx = useContext(FolderTreeContext)
  if (!ctx) throw new Error("useFolderTree must be used inside FolderTreeProvider")
  return ctx
}

// ─── useSidebarNavigate ─────────────────────────────────────────────────────────

/**
 * The single navigation entry point for EVERY sidebar control — the tree pages
 * and the "Home" header button alike. It selects the page and, on mobile, also
 * dismisses the sidebar sheet.
 *
 * Any new navigation affordance (a future header link, a footer shortcut, etc.)
 * should call this hook instead of the raw `select`, so the close-on-navigate
 * behaviour never has to be re-wired per control. Must be used inside
 * <SidebarProvider> (all sidebar controls are).
 */
export function useSidebarNavigate() {
  const { select } = useFolderTree()
  const { setOpen } = useSidebar()

  return useCallback(
    (id: string) => {
      select(id)
      setOpen(false)
    },
    [select, setOpen]
  )
}

// ─── FolderTree ───────────────────────────────────────────────────────────────

export function FolderTree() {
  const { selectedId } = useFolderTree()
  const navigate = useSidebarNavigate()

  return (
    <ul className="flex flex-col gap-0.5">
      {/* 'home' is surfaced by the sidebar header "Home" control, not the tree. */}
      {sidebarData
        .filter((node) => node.id !== 'home')
        .map((node) => (
          <FolderItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            select={navigate}
          />
        ))}
    </ul>
  )
}
