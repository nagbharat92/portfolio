import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
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
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
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
  )
}

export default App
