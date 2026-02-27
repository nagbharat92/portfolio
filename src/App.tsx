import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { FolderTreeProvider } from '@/components/folder-tree'
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

      <div className="relative flex flex-1 flex-col">
        {/* Mobile top bar — visible only below md */}
        <header className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-2xl md:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Explore</p>
            </TooltipContent>
          </Tooltip>
        </header>

        {/* Canvas */}
        <main className="relative flex-1">
        </main>
      </div>
    </SidebarProvider>
    </FolderTreeProvider>
  )
}

export default App
