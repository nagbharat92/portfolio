import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { Folder, FolderOpen, ChevronRight, File } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/motion"
import { useSidebar } from "@/components/ui/sidebar"
import {
  type SidebarNode,
  type PageNode,
  type FolderNode,
  sidebarData,
  findPage,
  collectFolderIds,
  findAncestorFolderIds,
} from "@/data/pages"

// ─── Depth padding ────────────────────────────────────────────────────────────
// Computed from spacing tokens: base indent + depth × step.
// Eliminates the static lookup table and scales to any depth.

// ─── FolderItem ───────────────────────────────────────────────────────────────

function FolderItem({
  node,
  depth,
  expandedIds,
  toggle,
  selectedId,
  select,
}: {
  node: SidebarNode
  depth: number
  expandedIds: Set<string>
  toggle: (id: string) => void
  selectedId: string | null
  select: (id: string) => void
}) {
  const isFolder = node.type === 'folder'
  const isOpen = isFolder && expandedIds.has(node.id)
  const isSelected = !isFolder && selectedId === node.id

  return (
    <li>
      <button
        onClick={() => {
          if (isFolder) toggle(node.id)
          else select(node.id)
        }}
        className={cn(
          "flex w-full items-center gap-(--tree-item-gap) rounded-md px-(--tree-item-px) py-(--tree-item-py) text-sm text-sidebar-foreground",
          "transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          "cursor-pointer",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
        style={{ paddingLeft: `calc(var(--tree-indent-base) + ${depth} * var(--tree-indent-step))` }}
      >
        {/* Chevron — only for folders */}
        {isFolder ? (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={transitions.microInteraction}
            className="flex shrink-0 items-center"
          >
            <ChevronRight className="size-3.5 text-sidebar-foreground/50" />
          </motion.span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Icon — folder open/closed for folders, file for pages */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="size-4 shrink-0 text-sidebar-foreground/70" />
          ) : (
            <Folder className="size-4 shrink-0 text-sidebar-foreground/70" />
          )
        ) : (
          <File className="size-4 shrink-0 text-sidebar-foreground/70" />
        )}

        <span className="truncate">{node.name}</span>
      </button>

      {/* Children — only rendered for open folders */}
      <AnimatePresence initial={false}>
        {isFolder && isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.expand}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            {(node as FolderNode).children.map((child) => (
              <FolderItem
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                toggle={toggle}
                selectedId={selectedId}
                select={select}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

// ─── Context ──────────────────────────────────────────────────────────────────

type FolderTreeContextValue = {
  expandedIds: Set<string>
  selectedId: string | null
  selectedPage: PageNode | null
  toggle: (id: string) => void
  select: (id: string) => void
}

const FolderTreeContext = createContext<FolderTreeContextValue | null>(null)

const STORAGE_KEY = 'portfolio-sidebar-expanded'

/** Reads the page id from the URL hash. Returns 'home' as fallback. */
function getInitialPageId(): string {
  const hash = window.location.hash // e.g. "#/experiment-1"
  const id = hash.replace(/^#\//, '').trim()
  return id && findPage(sidebarData, id) ? id : 'home'
}

/** Reads expanded folder ids from localStorage. Returns an empty array on failure. */
function getStoredExpandedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function FolderTreeProvider({ children }: { children: ReactNode }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initialPageId = getInitialPageId()
    const stored = getStoredExpandedIds()
    const ancestors = findAncestorFolderIds(sidebarData, initialPageId)
    // Merge stored + ancestors so the restored page's parent folders are visible
    return new Set([...stored, ...ancestors])
  })

  const [selectedId, setSelectedId] = useState<string | null>(() => getInitialPageId())

  const [selectedPage, setSelectedPage] = useState<PageNode | null>(() =>
    findPage(sidebarData, getInitialPageId())
  )

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

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
      // Auto-expand ancestors of the restored page
      const ancestors = findAncestorFolderIds(sidebarData, id)
      if (ancestors.length > 0) {
        setExpandedIds((prev) => {
          const next = new Set([...prev, ...ancestors])
          return next
        })
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <FolderTreeContext.Provider
      value={{ expandedIds, selectedId, selectedPage, toggle, select }}
    >
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

// ─── FolderTree ───────────────────────────────────────────────────────────────

export function FolderTree() {
  const { expandedIds, selectedId, toggle, select } = useFolderTree()
  const { isMobile, setOpenMobile } = useSidebar()

  const selectAndClose = useCallback(
    (id: string) => {
      select(id)
      if (isMobile) setOpenMobile(false)
    },
    [select, isMobile, setOpenMobile]
  )

  return (
    <ul className="flex flex-col gap-0.5">
      {sidebarData.map((node) => (
        <FolderItem
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          toggle={toggle}
          selectedId={selectedId}
          select={selectAndClose}
        />
      ))}
    </ul>
  )
}
