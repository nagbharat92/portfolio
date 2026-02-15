import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import './App.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'

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
        <header className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar px-4 py-2 shadow-2xl md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold tracking-tight">Bharat Nag</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* Canvas */}
        <main className="relative flex-1">
          {/* Desktop theme toggle — hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 hidden md:inline-flex"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
