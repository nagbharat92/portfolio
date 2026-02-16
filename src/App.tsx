import { useState, useEffect } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import './App.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { IconButton } from '@/components/ui/icon-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
      <AppSidebar />

      <div className="relative flex flex-1 flex-col">
        {/* Mobile top bar — visible only below md */}
        <header className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-2xl md:hidden">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-semibold tracking-tight">Bharat Nag</span>
          <IconButton
            tooltip={dark ? 'Light mode' : 'Dark mode'}
            tooltipSide="bottom"
            variant="ghost"
            className="ml-auto"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </IconButton>
        </header>

        {/* Canvas */}
        <main className="relative flex-1">
          {/* Desktop theme toggle — hidden on mobile */}
          <IconButton
            tooltip={dark ? 'Light mode' : 'Dark mode'}
            tooltipSide="bottom"
            variant="ghost"
            className="absolute top-0 right-0 hidden md:inline-flex"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </IconButton>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
