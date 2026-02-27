/**
 * pages.ts — Portfolio content data
 *
 * This is the single source of truth for all sidebar items and canvas content.
 * - FolderNode: a grouping container. Has children. No canvas view.
 * - PageNode:   a content item. Has a canvas view. Always a leaf node.
 *
 * To add a new project: add a PageNode inside the appropriate FolderNode.
 * To add a new category: add a FolderNode at the top level.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageNode = {
  id: string
  type: 'page'
  name: string
  url?: string         // iframe src — omit for pages with no live preview
  description?: string // short text above the iframe (1–2 sentences)
  techStack?: string[] // e.g. ["React", "Vite", "Tailwind CSS"]
  content?: string     // longer write-up below the iframe (markdown-friendly)
  year?: number
  featured?: boolean   // reserved — not used in UI yet
}

export type FolderNode = {
  id: string
  type: 'folder'
  name: string
  children: SidebarNode[]
}

export type SidebarNode = FolderNode | PageNode

// ─── Data ─────────────────────────────────────────────────────────────────────

export const sidebarData: SidebarNode[] = [
  {
    id: 'home',
    type: 'page',
    name: 'Home',
    // No url — the Home canvas is a bespoke layout, not an iframe.
    // Content is defined in the Canvas component directly (PRD 02).
  },

  {
    id: 'personal-work',
    type: 'folder',
    name: 'Personal Work',
    children: [
      {
        id: 'experiment-1',
        type: 'page',
        name: 'Experiment 1',
        url: 'https://bharatnag.dev', // placeholder — replace with real URL
        description: 'A sandbox for trying new ideas. Small, fast experiments built to learn something specific rather than ship something polished.',
        techStack: ['React', 'Vite', 'Tailwind CSS'],
        year: 2025,
        featured: true,
        content: `Building things in the open has taught me more than any tutorial ever could.

Each experiment here started with a single question — what happens if I just try it? Some went nowhere. A few turned into something worth keeping. All of them taught me something.

This is that collection. Unpolished by design. The point was never the output.`,
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Find a PageNode anywhere in the tree by id.
 * Returns null if not found or if the id belongs to a folder.
 */
export function findPage(nodes: SidebarNode[], id: string): PageNode | null {
  for (const node of nodes) {
    if (node.type === 'page' && node.id === id) return node
    if (node.type === 'folder') {
      const found = findPage(node.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Collect the ids of all folder nodes in the tree.
 * Used to set the initial expanded state — all folders start open.
 */
export function collectFolderIds(nodes: SidebarNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.type === 'folder') {
      ids.push(node.id)
      ids.push(...collectFolderIds(node.children))
    }
  }
  return ids
}
