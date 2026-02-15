import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" variant="floating">
      <SidebarHeader className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, I'm Bharat.
        </h1>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="p-6">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <p className="text-sm text-sidebar-foreground/70">
              Welcome to my corner of the internet. This site is a work in
              progress.
            </p>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <Button variant="ghost" size="icon" asChild>
          <a
            href="https://github.com/nagbharat92"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
