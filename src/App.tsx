import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { FolderTreeProvider } from '@/components/folder-tree'
import { Canvas } from '@/components/canvas'
import { CanvasActions } from '@/components/canvas-toolbar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function App() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const toggle = () => document.documentElement.classList.toggle('dark', dark)

    if (document.startViewTransition) {
      document.startViewTransition(toggle)
    } else {
      toggle()
    }
  }, [dark])

  return (
    <FolderTreeProvider>
    <SidebarProvider>
      <AppSidebar setDark={setDark} />

      <div className="relative flex flex-1 min-h-0">
        {/* Mobile toolbar — absolutely positioned, visible only below md */}
        <div className="absolute top-(--page-inset) left-(--page-inset) right-(--page-inset) z-10 flex items-center justify-between md:hidden">
          {/* Left actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger variant="filled" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Explore</p>
            </TooltipContent>
          </Tooltip>

          {/* Right actions */}
          <CanvasActions />
        </div>

        {/* Canvas — full bleed, scrolls independently */}
        <main className="flex-1 min-h-0">
          <Canvas />
        </main>
      </div>
    </SidebarProvider>
    </FolderTreeProvider>
  )
}

export default App
