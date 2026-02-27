import { AnimatePresence, motion } from "framer-motion"
import { useFolderTree } from "@/components/folder-tree"
import { ProjectCanvas } from "@/components/project-canvas"
import { duration, ease } from "@/lib/motion"

/**
 * Canvas — main content area of the portfolio.
 *
 * Handles page transitions via AnimatePresence crossfade.
 * All pages (including Home) are rendered by ProjectCanvas via the block renderer.
 */
export function Canvas() {
  const { selectedPage } = useFolderTree()

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence>
        {selectedPage && (
          <motion.div
            key={selectedPage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base, ease: ease.out }}
            className="absolute inset-0"
          >
            <ProjectCanvas page={selectedPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
