import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { FolderTreeProvider, useFolderTree } from '@/components/folder-tree'
import { Canvas } from '@/components/canvas'
import { HomeWorld } from '@/components/home-world'
import { transitions } from '@/lib/motion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function App() {
  const [dark, setDark] = useState(() =>
    document.documentElement.dataset.theme === 'dark'
  )

  useEffect(() => {
    const toggle = () => {
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#1A1815' : '#FCFAF3')
    }

    if (document.startViewTransition) {
      document.startViewTransition(toggle)
    } else {
      toggle()
    }
  }, [dark])

  return (
    <FolderTreeProvider>
      <AppLayout setDark={setDark} />
    </FolderTreeProvider>
  )
}

/**
 * AppLayout — picks the layout for the active route and animates between them.
 *
 *   - Home ('home') renders the immersive, full-bleed HomeWorld (no sidebar).
 *   - Every other route renders the sidebar + canvas shell.
 *
 * AnimatePresence (mode="wait") fades the outgoing layout out before the next
 * mounts, so the shell (sidebar included) leaves smoothly instead of popping
 * when you return home. Entrances stay with the inner animations
 * (sidebar-in CSS + content FadeInUp).
 */
function AppLayout({ setDark }: { setDark: (fn: (d: boolean) => boolean) => void }) {
  const { selectedId } = useFolderTree()

  return (
    <AnimatePresence mode="wait">
      {selectedId === 'home' ? (
        <motion.div
          key="home"
          className="flex h-full w-full"
          initial={false}
          exit={{ opacity: 0, transition: transitions.exit }}
        >
          <HomeWorld />
        </motion.div>
      ) : (
        <motion.div
          key="shell"
          className="flex h-full w-full"
          initial={false}
          exit={{ opacity: 0, transition: transitions.exit }}
        >
          <SidebarProvider>
            <AppSidebar setDark={setDark} />

            <div className="relative flex flex-1 min-h-0">
              {/* Mobile sidebar trigger — absolutely positioned, visible only below lg */}
              <div className="absolute top-(--page-inset) left-(--page-inset) z-10 flex items-center lg:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger variant="filled" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Explore</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Canvas — full bleed, scrolls independently */}
              <main className="flex-1 min-h-0">
                <Canvas />
              </main>
            </div>
          </SidebarProvider>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
