import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import { Folder, FolderOpen, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/motion"

export interface FolderNode {
  id: string
  name: string
  children?: FolderNode[]
}

const sampleFolders: FolderNode[] = [
  { id: "1", name: "To Check Later" },
  {
    id: "2",
    name: "Vibe Coding",
    children: [
      { id: "2-1", name: "Colors - Core Concepts" },
      { id: "2-2", name: "Gradient Background App" },
      { id: "2-3", name: "Next.js Empty App" },
      { id: "2-4", name: "Playboi Farti's AI Machine" },
      { id: "2-5", name: "Claude Usage" },
      {
        id: "2-6",
        name: "Untitled",
        children: [
          {
            id: "2-6-1",
            name: "Untitled",
            children: [
              {
                id: "2-6-1-1",
                name: "Untitled",
                children: [
                  {
                    id: "2-6-1-1-1",
                    name: "Untitled",
                    children: [
                      { id: "2-6-1-1-1-1", name: "Untitled" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Design Inspiration",
    children: [
      { id: "3-1", name: "Dribbble Saves" },
      { id: "3-2", name: "Awwwards Winners" },
      { id: "3-3", name: "Typography References" },
      { id: "3-4", name: "Color Palettes" },
    ],
  },
  { id: "4", name: "Reading List" },
  {
    id: "5",
    name: "Work Projects",
    children: [
      { id: "5-1", name: "Dashboard Redesign" },
      { id: "5-2", name: "API Documentation" },
      { id: "5-3", name: "Component Library" },
      {
        id: "5-4",
        name: "Client Sites",
        children: [
          { id: "5-4-1", name: "Acme Corp" },
          { id: "5-4-2", name: "Startup XYZ" },
          { id: "5-4-3", name: "Portfolio v2" },
        ],
      },
    ],
  },
  { id: "6", name: "Bookmarks" },
  {
    id: "7",
    name: "Learning",
    children: [
      { id: "7-1", name: "Rust Fundamentals" },
      { id: "7-2", name: "Three.js Experiments" },
      { id: "7-3", name: "Machine Learning Notes" },
      { id: "7-4", name: "System Design" },
      { id: "7-5", name: "WebGL Shaders" },
    ],
  },
  { id: "8", name: "Recipes" },
  {
    id: "9",
    name: "Travel",
    children: [
      { id: "9-1", name: "Japan 2026" },
      { id: "9-2", name: "Iceland Trip" },
      { id: "9-3", name: "Portugal Notes" },
    ],
  },
  { id: "10", name: "Music Production" },
  { id: "11", name: "Fitness Tracker Ideas" },
  { id: "12", name: "Gift Ideas" },
  {
    id: "13",
    name: "Archive",
    children: [
      { id: "13-1", name: "Old Blog Posts" },
      { id: "13-2", name: "Deprecated Projects" },
      { id: "13-3", name: "College Notes" },
    ],
  },
]

const depthPadding: Record<number, string> = {
  0: "pl-2",
  1: "pl-6",
  2: "pl-10",
  3: "pl-14",
  4: "pl-18",
  5: "pl-22",
}

function FolderItem({
  node,
  depth,
  expandedIds,
  toggle,
  selectedId,
  select,
}: {
  node: FolderNode
  depth: number
  expandedIds: Set<string>
  toggle: (id: string) => void
  selectedId: string | null
  select: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isOpen = expandedIds.has(node.id)
  const isSelected = !hasChildren && selectedId === node.id

  return (
    <li>
      <button
        onClick={() => {
          if (hasChildren) toggle(node.id)
          else select(node.id)
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground",
          "transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          "cursor-pointer",
          isSelected && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          depthPadding[depth] ?? "pl-2"
        )}
      >
        {hasChildren ? (
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
        {isOpen && hasChildren ? (
          <FolderOpen className="size-4 shrink-0 text-sidebar-foreground/70" />
        ) : (
          <Folder className="size-4 shrink-0 text-sidebar-foreground/70" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitions.expand}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            {node.children!.map((child) => (
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

function collectParentIds(nodes: FolderNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      ids.push(node.id)
      ids.push(...collectParentIds(node.children))
    }
  }
  return ids
}

// ---- Context to persist folder-tree state across mobile/desktop switches ----

type FolderTreeContextValue = {
  expandedIds: Set<string>
  selectedId: string | null
  toggle: (id: string) => void
  select: (id: string) => void
}

const FolderTreeContext = createContext<FolderTreeContextValue | null>(null)

export function FolderTreeProvider({ children }: { children: ReactNode }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(collectParentIds(sampleFolders))
  )
  const [selectedId, setSelectedId] = useState<string | null>("1")

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const value: FolderTreeContextValue = { expandedIds, selectedId, toggle, select: setSelectedId }

  return (
    <FolderTreeContext.Provider value={value}>
      {children}
    </FolderTreeContext.Provider>
  )
}

function useFolderTree() {
  const ctx = useContext(FolderTreeContext)
  if (!ctx) throw new Error("useFolderTree must be used within FolderTreeProvider")
  return ctx
}

export function FolderTree() {
  const { expandedIds, selectedId, toggle, select } = useFolderTree()

  return (
    <ul className="flex flex-col gap-0.5">
      {sampleFolders.map((folder) => (
        <FolderItem
          key={folder.id}
          node={folder}
          depth={0}
          expandedIds={expandedIds}
          toggle={toggle}
          selectedId={selectedId}
          select={select}
        />
      ))}
    </ul>
  )
}
